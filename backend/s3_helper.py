"""S3 presigned URL helpers for submission upload + artifact retrieval."""
from aws import S3_SUBMISSIONS_BUCKET, s3


def submission_key(user_id: str, job_id: str) -> str:
    return f"submissions/{user_id}/{job_id}/strategy.zip"


def presigned_post(key: str, content_type: str = "application/zip", expires: int = 3600) -> dict:
    return s3.generate_presigned_post(
        Bucket=S3_SUBMISSIONS_BUCKET,
        Key=key,
        Fields={"Content-Type": content_type},
        Conditions=[
            {"Content-Type": content_type},
            ["content-length-range", 0, 100 * 1024 * 1024],
        ],
        ExpiresIn=expires,
    )


def presigned_get(key: str, bucket: str | None = None, expires: int = 900) -> str:
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket or S3_SUBMISSIONS_BUCKET, "Key": key},
        ExpiresIn=expires,
    )
