"""Shared boto3 clients built once from env. Import from here everywhere."""
import os

import boto3
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

S3_SUBMISSIONS_BUCKET = os.getenv("S3_SUBMISSIONS_BUCKET", "")
S3_DATASETS_BUCKET = os.getenv("S3_DATASETS_BUCKET", "")
SQS_JOBS_URL = os.getenv("SQS_JOBS_URL", "")

DYNAMO_USERS_TABLE = os.getenv("DYNAMO_USERS_TABLE", "dlqf_users")
DYNAMO_PROJECTS_TABLE = os.getenv("DYNAMO_PROJECTS_TABLE", "dlqf_projects")
DYNAMO_JOBS_TABLE = os.getenv("DYNAMO_JOBS_TABLE", "dlqf_jobs")
DYNAMO_JOB_RUNS_TABLE = os.getenv("DYNAMO_JOB_RUNS_TABLE", "dlqf_job_runs")
DYNAMO_RESULTS_TABLE = os.getenv("DYNAMO_RESULTS_TABLE", "dlqf_results")

_session = boto3.session.Session(region_name=AWS_REGION)

s3 = _session.client("s3")
sqs = _session.client("sqs")
dynamodb = _session.resource("dynamodb")
