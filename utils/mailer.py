import smtplib
import json
import os

class Mailer:
    """ Class to initiate the email alert function. """

    def __init__(self):
        # Use environment variables for email configuration
        self.email = os.getenv("EMAIL_SEND", "")
        self.password = os.getenv("EMAIL_PASSWORD", "")
        self.port = 465

    def send(self, recipient_email):
        if not self.email or not self.password:
            print("Email configuration not found. Please set EMAIL_SEND and EMAIL_PASSWORD environment variables.")
            return
        
        try:
            server = smtplib.SMTP_SSL('smtp.gmail.com', self.port)
            server.login(self.email, self.password)
            # message to be sent
            SUBJECT = 'BUS MONITORING ALERT!'
            TEXT = f'Passenger limit exceeded in your bus system!'
            message = 'Subject: {}\n\n{}'.format(SUBJECT, TEXT)
            # send the mail
            server.sendmail(self.email, recipient_email, message)
            server.quit()
            print(f"Alert email sent to {recipient_email}")
        except Exception as e:
            print(f"Failed to send email: {e}")
