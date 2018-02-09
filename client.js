  // $(function () {
  //   var socket = io();
  //   $('form').submit(function(){
  //     socket.emit('chat message', $('#message').val());
  //     $('#message').val('');
  //     return false;
  //   });
  //   socket.on('chat message', function(msg){
  //     $('#messages').append($('<li>').text(msg));
  //   });
  // });

  // function onChangeHandler(value){
  //   console.log(value);
  // }

  let x = document.getElementById("message");

  x.addEventListener("change", function(){
      alert("HIIII")
  })

  // console.log(x);
