import sgMail from "@sendgrid/mail";
// sgMail.setApiKey(
//   "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"
// );
sgMail.setApiKey(
  "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"
);

class sendMessage{
 public sendMail1 = (obj:any) => {
  const msg = {
    to: obj.to, 
    from: obj.from,
    subject: obj.subject,
    text: obj.content
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error:any) => {
      console.log(error);
    });
};
}
export default new sendMessage();
