document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', (e) => compose_email(e));
  
  // By default, load the inbox
  load_mailbox('inbox');

  // Send Email
  document.querySelector('#compose-form').addEventListener('submit', send_email);
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  const emails_view = document.querySelector('#emails-view')
  
  // Show the mailbox and hide other views
  emails_view.style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      //Each email should then be rendered in its own box (e.g. as a <div> with a border) that displays who the email is from, what the subject line is, and the timestamp of the email.
      

      emails.forEach(mail => {
        const emailDiv = document.createElement('div');
        const emailHeader = document.createElement('h4');
        try {
          if(mailbox === 'sent'){
              emailHeader.innerHTML = 'Recipients: ' + mail.recipients + '<br>Subject: ' + mail.subject + '<br>Timestamp: ' + mail.timestamp + '<br>';
          }else{
            emailHeader.innerHTML = 'From: ' + mail.sender + '<br>Subject: ' + mail.subject + '<br>Timestamp: ' + mail.timestamp + '<br>';
          }
          emailDiv.appendChild(emailHeader);
          emailDiv.style.border = '1px solid black';
          emails_view.appendChild(emailDiv);
  
  
          if(mail.read === true){
            emailDiv.style.backgroundColor = 'lightgray';
          }
          } catch (error) {
            emailHeader.innerHTML = 'You dont have any emails'
          }
  
        //If the email is unread, it should appear with a white background. If the email has been read, it should appear with a gray background.
        });
      });

      
}

function send_email(e){
  e.preventDefault();
  
  // Send the email
  // You’ll likely want to make a POST request to /emails, passing in values for recipients, subject, and body.
  const newEmailForm = e.target;
  const recipients = newEmailForm[1].value;
  const subject = newEmailForm[2].value;
  const body = newEmailForm[3].value;

  const emailObj = {
    recipients: recipients,
    subject: subject,
    body: body
  }

  const JSONemailObj = JSON.stringify(emailObj);

  fetch('/emails', {
    method: 'POST',
    body: JSONemailObj
  })
  .then(resp => resp.json())
  .then(result => {console.log(result);
  });
  
  // Once the email has been sent, load the user’s sent mailbox.
  load_mailbox('sent')
}