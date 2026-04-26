from models import Bench, Comment
from sqlalchemy.orm import Session

def get_all_benches(db: Session):
    return db.query(Bench).all()

def create_bench(db, lat, lon, desc, note, image_filename=None, title=None, privacy=3.0, romantic=3.0, comfort=3.0):
    new_bench = Bench(
        latitude=lat,
        longitude=lon,
        title=title,
        description=desc,
        note=note,
        image=image_filename,
        privacy=privacy,
        romantic=romantic,
        comfort=comfort,
    )
    db.add(new_bench)
    db.commit()
    db.refresh(new_bench)
    return new_bench

def add_comment(db, bench_id: int, author: str, content: str):
    comment = Comment(bench_id=bench_id, author=author, content=content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

def get_comments(db, bench_id: int):
    return db.query(Comment).filter(Comment.bench_id == bench_id).all()
