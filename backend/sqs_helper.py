"""SQS enqueue helper for dispatching jobs to the worker layer."""
import json

from aws import SQS_JOBS_URL, sqs


def enqueue_job(payload: dict) -> str:
    """Enqueue a job payload. Returns the SQS MessageId.

    Expected keys: job_id, run_id, user_id, s3_key.
    """
    resp = sqs.send_message(
        QueueUrl=SQS_JOBS_URL,
        MessageBody=json.dumps(payload),
    )
    return resp["MessageId"]
