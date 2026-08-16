resource "aws_dynamodb_table" "eval_table" {
  name             = "eval_table"
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = "PK"
  range_key        = "SK"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  # Attribute definitions
  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "contentType"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

}