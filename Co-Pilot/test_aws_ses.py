import os
import boto3
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def test_aws_ses():
    """Test AWS SES connectivity using credentials from .env file"""
    print("Testing AWS SES connectivity...")

    # Check if credentials are loaded
    aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')  # Note: AWS_SECRET_ACCESS_KEY is the standard name
    aws_region = os.getenv('AWS_REGION', 'us-east-1')

    if not aws_access_key or not aws_secret_key:
        print("ERROR: AWS credentials not found in .env file")
        return False

    try:
        # Create SES client
        ses_client = boto3.client(
            'ses',
            region_name=aws_region,
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key
        )

        # Test connection by getting send quota
        response = ses_client.get_send_quota()

        # Success! Print quota information
        print("SUCCESS: Connected to AWS SES")
        print(f"Daily sending quota: {response['Max24HourSend']}")
        print(f"Sent emails in last 24h: {response['SentLast24Hours']}")
        print(f"Maximum send rate: {response['MaxSendRate']} emails/second")
        return True

    except Exception as e:
        print(f"ERROR: Failed to connect to AWS SES: {str(e)}")
        return False


if __name__ == "__main__":
    test_aws_ses()
