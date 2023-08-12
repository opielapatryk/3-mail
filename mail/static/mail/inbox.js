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
        emailDiv.addEventListener('click',() => view_email(mail.id));
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
  
  
          if(mail.archived === true){
            emailDiv.style.backgroundColor = 'lightgray';
          }
          } catch (error) {
            emailHeader.innerHTML = 'You dont have any emails'
          }
            // Recall that you can send a PUT request to /emails/<email_id> to mark an email as archived or unarchived.

          // Add to inbox button that allows you to archive the email.
          // Add to Archive button that allows you to unarchive the email.
          // Once an email has been archived or unarchived, load the user’s inbox.

          if(mailbox === 'inbox'){
            const archiveButton = document.createElement('button');
            archiveButton.innerHTML = 'Archive';
            emailDiv.appendChild(archiveButton);
            archiveButton.style.zIndex = '9999';

            archiveButton.onclick = (event) =>{
              event.stopPropagation();
                      // Mark email as archived 
              fetch(`/emails/${mail.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: true
                })
              }).then(load_mailbox('inbox'))
              document.location.reload();

            }
            // Load user inbox
          } else if(mailbox === 'archive'){
            const archiveButton = document.createElement('button');
            archiveButton.innerHTML = 'Unarchive';
            emailDiv.appendChild(archiveButton);
            archiveButton.style.zIndex = '9999';
            archiveButton.onclick = (event) =>{
              event.stopPropagation();
                      // Mark email as unarchived 
              fetch(`/emails/${mail.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: false
                })
              }).then(load_mailbox('inbox'))
              document.location.reload();

            }
            // Load user inbox
            
          }

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

function view_email(email_id){
  console.log('xd')

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      console.log(email);
      const emails_view = document.querySelector('#emails-view')
      emails_view.innerHTML = ''

      // create html elements with mail content 
      const emailDiv = document.createElement('div');
      const emailHeader = document.createElement('h4');
      emailHeader.innerHTML = 'Sender: ' + email.sender + '<br>Recipients: ' + email.recipients + '<br>Subject: ' + email.subject + '<br>Tiimestamp: ' + email.timestamp + '<br>Body: ' + email.body;
      emailDiv.appendChild(emailHeader);
      emailDiv.style.border = '1px solid black';
      emails_view.appendChild(emailDiv);

      // Mark email as read 
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })

      // Reply button
      const replyButton = document.createElement('button');
      replyButton.innerHTML = 'Reply';
      replyButton.onclick = () => {
        // Take user to composition form

          // Show compose view and hide other views
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'block';

          // Clear out composition fields
          document.querySelector('#compose-recipients').value = email.sender;
          if (!email.subject.startsWith("Re:")){
            document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
          }else{
            document.querySelector('#compose-subject').value = email.subject;
          }
          document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: "${email.body}"`;
      }
      emails_view.appendChild(replyButton);
  });
}


// Pre-fill the body of the email with a line like "On Jan 1 2020, 12:00 AM foo@example.com wrote:" followed by the original text of the email.