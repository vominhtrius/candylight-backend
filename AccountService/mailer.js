var nodemailer = require('nodemailer');
const request = require('request');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'johnschooling123@gmail.com',
    pass: 'khzlxfsqdpzwqxbs'
  }
});

// var mailOptions = {
//   from: 'admin@qlda.com',
//   to: 'nganhtuan200297@gmail.com',
//   subject: 'Kết quả học tập tháng',
//   text: 'That was easy!'
// };

function getResult(userId, month, callback) {
  const options = {
    url: 'http://103.114.107.16:8005/api/examination/result_point_exam/' + userId + '/time?time=' + month,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8',
    }
  };
  request(options, function (err, resRQ, body) {
    let json = JSON.parse(body);
    return callback(json);
  });
}

function sendEmail(userId, name, to, month) {
  getResult(userId, month, value => {
    var result = "";
    if (value.message) {
      result = `<h3> Học sinh chưa làm bài kiểm tra nào trong tháng này </h3>`;
    } else {
      var listMathPointExam = value.resultPointExam.listMathPointExam;
      var reportMath = ``;
      listMathPointExam.forEach(ex => {
        reportMath += `
      <tr>
          <td>Đề ${ex.title}</td>
          <td>${ex.point} điểm</td>
        </tr>`
      })

      var listVietnamesePointExam = value.resultPointExam.listVietnamesePointExam;
      var reportVietnamese = ``;
      listVietnamesePointExam.forEach(ex => {
        reportVietnamese += `
        <tr>
          <td>${ex.title}</td>
          <td>${ex.point}</td>
        </tr>
     `
      })
      result = `<h2>Môn Toán</h2>
      <table style="width:100%">
        ${reportMath}
      </table>
      
      <h2>Môn Tiếng Việt</h2>
      <table style="width:100%">
       ${reportVietnamese}
      </table>`;
    }
    var html = `
    <head>
    <style>
    table, th, td {
      border: 1px solid black;
      border-collapse: collapse;
    }
    th, td {
      padding: 5px;
      text-align: left;    
    }
    h1 h3{
        text-align: center
    }
    </style>
    </head>
    <body>
        <h1>
            Kết quả các bài kiểm tra tháng ${month} của học sinh ${name}
        </h1>
        ${result} 
    </body>
    `

    var mailOptions = {
      from: 'admin@qlda.com',
      to: to,
      subject: 'Kết quả học tập tháng ' + month + ' của học sinh ' + name,
      html: html
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent ' + mailOptions.to + ': ' + info.response);
      }
    });
  })

}
// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });
module.exports = {
  sendEmail: sendEmail
}