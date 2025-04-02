import os
from dotenv import load_dotenv
from email_service import AWSSESService
import logging
import random
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)

# Load environment variables
load_dotenv()


def send_test_email():
    # Create email service instance
    email_service = AWSSESService({
        'AWS_ACCESS_KEY': os.getenv('AWS_ACCESS_KEY_ID'),
        'AWS_SECRET_KEY': os.getenv('AWS_SECRET_ACCESS_KEY'),
        'AWS_REGION': os.getenv('AWS_REGION', 'us-west-2'),
        'DEFAULT_SENDER': os.getenv('DEFAULT_SENDER')
    })

    # Verify configuration
    if not email_service.is_configured():
        print("Email service is not properly configured!")
        return False

    # Use a verified recipient email address
    recipient = "lovieokum@gmail.com"  # CHANGE THIS

    print(f"Sending test email to {recipient}...")

    # List of random names
    names = [
        "Alex Johnson", "Morgan Smith", "Taylor Williams", "Jordan Brown",
        "Casey Davis", "Riley Wilson", "Jamie Miller", "Avery Moore",
        "Quinn Thomas", "Jordan Wright", "Reese Taylor", "Dakota Robinson"
    ]

    # Generate random name and current date
    random_name = random.choice(names)
    current_date = datetime.now().strftime("%B %d, %Y")

    # Send email
    result = email_service.send_email(
        subject="Test Email for Our Copilot",
        recipients=[recipient],
        text_body="This is your certificate, thanks for participating.",
        html_body=f"""
<div style="width: 800px; padding: 20px; margin: 0 auto; border: 20px solid #C9AE5D; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="border: 5px solid #234E70; padding: 20px; text-align: center;">
        <div style="font-size: 36px; font-weight: bold; color: #234E70; margin: 20px 0; text-transform: uppercase;">Certificate</div>
        
        <div style="font-size: 24px; margin: 20px 0;">This certifies that</div>
        
        <div style="font-size: 30px; font-weight: bold; margin: 20px 0; color: #C9AE5D; font-family: 'Brush Script MT', cursive;">{random_name}</div>
        
        <div style="font-size: 20px; margin: 20px 0;">
            has successfully participated in our test email program.
        </div>
        
        <div style="font-size: 18px; margin: 60px 0 40px 0;">
            <span>Awarded on {current_date}</span>
        </div>
        
        <div style="border-top: 2px solid #000; width: 300px; margin: 0 auto; padding-top: 10px; font-style: italic;">
            This is a test email, thanks for participating.
        </div>
    </div>
</div>
"""
        #"<h1>Test Email</h1><p>This is your certificate<b>and a test email</b> thanks for participating.</p>"
    )

    if result:
        print("Email request accepted! Check your inbox in a few minutes.")
        return True
    else:
        print("Failed to send email. Check logs for details.")
        return False


if __name__ == "__main__":
    send_test_email()
