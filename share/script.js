const qrcodeDiv = document.getElementById("qrcode");
function setQRCode(link) {
  while(qrcodeDiv.firstChild) {
    qrcodeDiv.removeChild(qrcodeDiv.firstChild);
  }
  new QRCode(qrcodeDiv, {
    text: link,
    width: 512,
    height: 512,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });
}
const defaultHref = "https://tylergordonhill.com";
setQRCode(defaultHref);

const buttons = document.getElementsByTagName('button');
for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function() {
    if (this.classList.contains('selected')) {
      this.classList.remove('selected');
      setQRCode(defaultHref);
    } else {
      for (let j = 0; j < buttons.length; j++) {
        buttons[j].classList.remove('selected');
      }
      buttons[i].classList.add('selected');
      setQRCode(buttons[i].dataset.href);
    }
  });
}
