# AWS Lambda function — triggered by S3 when a new cover image is uploaded.
# Downloads the original, resizes it to 300px wide, saves to thumbnails/.

import boto3
import os
from PIL import Image
from io import BytesIO

s3 = boto3.client("s3")
THUMBNAIL_WIDTH = 300

def lambda_handler(event, context):
    for record in event["Records"]:
        bucket = record["s3"]["bucket"]["name"]
        key    = record["s3"]["object"]["key"]

        print(f"Processing: s3://{bucket}/{key}")

        try:
            # Download original
            response     = s3.get_object(Bucket=bucket, Key=key)
            image_data   = response["Body"].read()
            content_type = response["ContentType"]

            print(f"Downloaded {len(image_data)} bytes, content-type: {content_type}")

            # Resize
            image = Image.open(BytesIO(image_data))
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGB")

            original_width, original_height = image.size
            print(f"Original size: {original_width}x{original_height}")

            ratio          = THUMBNAIL_WIDTH / original_width
            thumbnail_size = (THUMBNAIL_WIDTH, int(original_height * ratio))
            image          = image.resize(thumbnail_size, Image.LANCZOS)

            # Save to buffer
            buffer = BytesIO()
            image.save(buffer, format="JPEG", quality=85)
            buffer.seek(0)

            # Upload thumbnail
            filename      = key.split("/")[-1]
            thumbnail_key = f"thumbnails/{filename}"

            s3.put_object(
                Bucket=bucket,
                Key=thumbnail_key,
                Body=buffer,
                ContentType="image/jpeg",
            )

            print(f"Thumbnail saved: s3://{bucket}/{thumbnail_key}")

        except Exception as e:
            print(f"ERROR processing {key}: {str(e)}")
            raise  # re-raise so Lambda marks the invocation as failed

    return {"statusCode": 200}