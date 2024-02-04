from django.db import models
from django.utils import timezone
from django.conf import settings
from django.core.mail import EmailMultiAlternatives, send_mail
from django.utils.html import strip_tags


class EmailTemplate(models.Model):
    title = models.CharField(max_length=255,blank=False, null=False)
    docket = models.CharField(max_length=128,blank=True, null=True)
    subject = models.CharField(max_length=255,blank=False, null=False)
    preview = models.CharField(max_length=255,blank=True, null=True)
    from_name = models.CharField(max_length=255, blank=False, null=False, default=settings.DEFAULT_FROM_NAME)
    from_email = models.CharField(max_length=255, blank=False, null=False, default=settings.DEFAULT_FROM_EMAIL)
    html = models.TextField(blank=False, null=False)
    date_created = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title + " - " + str(self.docket or '')

    # Contact list will be a list of contacts in the future. For now it's a list of strings
    def sendEmail(self, contactList, context=None, subject=None, preview=None, from_name=None, from_email=None, reply_email = None,):
        subject = subject or self.subject
        preview = preview or self.preview
        html = self.html
        plain_message = strip_tags(html)
        from_name = from_name or self.from_name
        from_email = from_email or self.from_email
        print(reply_email)
        reply_email = reply_email or [from_email]
        print(reply_email)

        complete_email = from_name + " <" + from_email + ">"


        # Have to loop over this and append each email to a datatuple and then use send mass mail
        # Probably have to loop in in a cron jobs function with a queue to sync with amazon sending rates

        email = EmailMultiAlternatives(
            subject=subject,
            body = html,
            from_email = complete_email,
            to = contactList,
            reply_to = reply_email,
            alternatives=((html, 'text/html'),),
        )

        print(email.reply_to)

        email.send()

class Contact(models.Model):
    email = models.EmailField(
        unique=True,    
    )
    first_name = models.CharField(max_length=128,null=True,blank=True)
    last_name = models.CharField(max_length=128,null=True,blank=True)
    date_recieved = models.DateTimeField(default=timezone.now)
    ip_address = models.GenericIPAddressField(null=True,blank=True)
    subscribed = models.BooleanField(null=False,blank=False, default=False)

    def __str__(self):
        return self.email

class MailingList(models.Model):
    title = models.CharField(max_length=255,blank=False, null=False)
    contact_list = models.ManyToManyField(Contact)

    def __str__(self):
        return self.title

class Deployment(models.Model):
    deployment_date = models.DateField(blank=False, null=False)
    deployment_time = models.TimeField(blank=False, null=False)
    # Protect becasue if you try deleting a template that has been sent we want to prevent it
    email_template = models.ForeignKey(EmailTemplate, on_delete=models.PROTECT)
    mailing_list = models.ForeignKey(MailingList, on_delete=models.PROTECT)
