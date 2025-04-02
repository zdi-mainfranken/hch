import os
import boto3
from botocore.exceptions import ClientError
import logging
from threading import Thread

logger = logging.getLogger(__name__)


class AWSSESService:
    def __init__(self, config=None):
        self.config = config or {
            'AWS_ACCESS_KEY': os.getenv('AWS_ACCESS_KEY_ID', ''),  # Note the ID suffix
            'AWS_SECRET_KEY': os.getenv('AWS_SECRET_ACCESS_KEY', ''),  # Use standard name
            'AWS_REGION': os.getenv('AWS_REGION', 'us-east-1'),
            'DEFAULT_SENDER': os.getenv('DEFAULT_SENDER', '')
        }

        self.aws_access_key = self.config.get('AWS_ACCESS_KEY')
        self.aws_secret_key = self.config.get('AWS_SECRET_KEY')
        self.aws_region = self.config.get('AWS_REGION')
        self.default_sender = self.config.get('DEFAULT_SENDER')

        self.client = None
        if self.aws_access_key and self.aws_secret_key:
            self.client = boto3.client(
                'ses',
                region_name=self.aws_region,
                aws_access_key_id=self.aws_access_key,
                aws_secret_access_key=self.aws_secret_key
            )

    def is_configured(self):
        return self.client is not None and self.default_sender is not None

    def send_email(self, subject, recipients, text_body, html_body=None,
                   sender=None, attachments=None):
        if not self.is_configured():
            logger.error("AWS SES not properly configured")
            return False

        thread = Thread(
            target=self._send_email_async,
            args=(subject, recipients, text_body, html_body, sender, attachments)
        )
        thread.start()
        return True

    def _send_email_async(self, subject, recipients, text_body, html_body=None,
                          sender=None, attachments=None):
        try:
            sender_email = sender or self.default_sender

            # Configure email parameters
            email_message = {
                'Subject': {'Data': subject},
                'Body': {
                    'Text': {'Data': text_body}
                }
            }

            if html_body:
                email_message['Body']['Html'] = {'Data': html_body}

            # Send the email
            response = self.client.send_email(
                Source=sender_email,
                Destination={'ToAddresses': recipients},
                Message=email_message
            )

            logger.info(f"Email sent via AWS SES, MessageId: {response['MessageId']}")

        except ClientError as e:
            logger.error(f"Failed to send email via AWS SES: {str(e)}")
