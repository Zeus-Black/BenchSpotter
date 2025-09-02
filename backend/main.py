from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Path, Depends, Request, Response, Cookie, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from schemas import BenchOut, CommentOut
from sqlalchemy.orm import joinedload, Session
from sqlalchemy import func
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
import models, crud, database
from PIL import Image, UnidentifiedImageError, ImageOps
from io import BytesIO
from uuid import uuid4
from dotenv import load_dotenv
import os
import bleach


app = FastAPI()
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

origins = ["https://benchspotter.live"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=database.engine)
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.post("/benches")
async def create_bench(
    latitude: float = Form(...),
    longitude: float = Form(...),
    description: Optional[str] = Form(None),
    note: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db)
):
    clean_description = bleach.clean(description or "", tags=[], strip=True)
    if len(clean_description) > 300:
        raise HTTPException(status_code=400, detail="Description too long")
    if note is not None and not (0 <= note <= 5):
        raise HTTPException(status_code=400, detail="Note outside the range 0-5")

    filename = None
    if image and image.filename:
        if image.content_type not in ("image/jpeg", "image/png"):
            raise HTTPException(status_code=400, detail="Unsupported image type")
        size = int(image.headers.get("content-length", 0))
        if size > 8_000_000:
            raise HTTPException(status_code=413, detail="File too large")

        contents = await image.read()
        if contents:
            try:
                img = Image.open(BytesIO(contents))
                img = ImageOps.exif_transpose(img)
            except UnidentifiedImageError:
                raise HTTPException(status_code=400, detail="Invalid image file")

            if img.mode != "RGB":
                img = img.convert("RGB")

            filename = f"{uuid4()}.jpeg"
            path = f"static/{filename}"

            img.save(path, format="JPEG", quality=70, optimize=True)
    return crud.create_bench(db, latitude, longitude, clean_description, note, filename)

@app.post("/benches/{bench_id}/comments")
def post_comment(
    request: Request,
    response: Response,
    bench_id: int = Path(...), 
    author: Optional[str] = Form(None),
    content: str = Form(...),
    db: Session = Depends(database.get_db)
):

    author_cookie: str = request.cookies.get("author")
    if author_cookie:
        clean_author = author_cookie
    else:
        if not author:
            raise HTTPException(status_code=400, detail="Author missing")
        clean_author = bleach.clean(author, tags=[], strip=True)
        response.set_cookie(
            key="author",
            value=clean_author,
            max_age=30*24*3600,
            samesite="lax"
        )

    clean_content = bleach.clean(content or "", tags=[], strip=True)
    if len(clean_content) == 0 or len(clean_content) > 200:
        raise HTTPException(status_code=400, detail="Invalid comment length")

    return crud.add_comment(db, bench_id, clean_author, clean_content)

@app.get("/benches", response_model=List[BenchOut])
def read_benches():
    db = next(database.get_db())
    return db.query(models.Bench).options(joinedload(models.Bench.comments)).all()

@app.get("/benches/{bench_id}/comments", response_model=List[CommentOut])
def get_comments(bench_id: int, skip: int = Query(0, ge=0), limit: int = Query(5, ge=1), db: Session = Depends(database.get_db)):
    bench = db.query(models.Bench).filter(models.Bench.id == bench_id).first()
    if not bench:
        raise HTTPException(status_code=404, detail="Bench not found")

    return (
        db.query(models.Comment)
        .filter(models.Comment.bench_id == bench_id)
        .order_by(models.Comment.created_at.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

@app.get("/login", response_class=HTMLResponse)
def login_form(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/login")
def login(request: Request, username: str = Form(...), password: str = Form(...)):
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        request.session["user"] = "admin"
        return RedirectResponse(url="/admin", status_code=302)
    return templates.TemplateResponse("login.html", {
        "request": request,
        "error": True
    })

def require_login(request: Request):
    if request.session.get("user") != "admin":
        return RedirectResponse(url="/login", status_code=302)

@app.get("/admin", response_class=HTMLResponse, dependencies=[Depends(require_login)])
def admin_page(request: Request):
    if request.session.get("user") != "admin":
        return RedirectResponse(url="/login", status_code=302)
    return templates.TemplateResponse("admin.html", {"request": request})

@app.get("/admin/benches", dependencies=[Depends(require_login)])
def get_all_benches(db: Session = Depends(database.get_db)):
    return db.query(models.Bench).all()

@app.get("/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/login")

@app.get("/admin/stats", response_class=HTMLResponse, dependencies=[Depends(require_login)])
def stats_page(request: Request):
    if request.session.get("user") != "admin":
        return RedirectResponse(url="/login", status_code=302)
    return templates.TemplateResponse("stats.html", {"request": request})
    
@app.get("/admin/stats/data", dependencies=[Depends(require_login)])
def get_stats(db: Session = Depends(database.get_db)):
    total_benches = db.query(models.Bench).count()
    total_comments = db.query(models.Comment).count()
    avg_note = db.query(func.avg(models.Bench.note)).scalar()

    comments_per_bench = (
        db.query(models.Comment.bench_id, func.count(models.Comment.id))
        .group_by(models.Comment.bench_id)
        .all()
    )

    return {
        "total_benches": total_benches,
        "total_comments": total_comments,
        "average_note": round(avg_note or 0, 1),
        "comments_per_bench": [
            {"bench_id": bench_id, "count": count}
            for bench_id, count in comments_per_bench
        ]
    }

@app.delete("/benches/{bench_id}", dependencies=[Depends(require_login)])
def delete_bench(
    bench_id: int,
    db: Session = Depends(database.get_db),
    request: Request = None,
):
    bench = db.query(models.Bench).get(bench_id)
    if not bench:
        raise HTTPException(status_code=404, detail="Bench not found")
    db.delete(bench)
    db.commit()
    return {"ok": True}

@app.delete("/benches/{bench_id}/comments/{comment_id}", dependencies=[Depends(require_login)])
def delete_comment_api(
    bench_id: int,
    comment_id: int,
    db: Session = Depends(database.get_db),
    request: Request = None,
):
    comment = (
        db.query(models.Comment)
          .filter(models.Comment.bench_id == bench_id,
                  models.Comment.id == comment_id)
          .first()
    )
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()
    return {"ok": True}