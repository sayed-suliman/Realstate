// $(document).ready(function(){
//     $("#login-form").submit(function(e){
//         e.preventDefault()
//         $.ajax({
//             type:"POST",
//             url:"/register",
//             data:{
//                 username:"khan",
//             },
//             success:function(result){
//                 alert(result)
//             },

//         })
//     })
// })
$(document).ready(function(){
    // let pass = $("#password").val()
    // console.log(pass)
    let pass = ""
    let c_pass = ""
console.log()
    $(".pass").keyup(function(){
        pass = $("#password").val()
        c_pass = $("#c_password").val()
       if(pass === "" && c_pass === ""){
            $("#password").css("border","1px solid #ced4da")
            $("#c_password").css("border","1px solid #ced4da")
           
        }else if(pass.length < 6 ){
            $("#password").css("border","1px solid red")
        }else if(pass != c_pass){
            $("#password").css("border","1px solid #ced4da")
            $("#c_password").css("border","1px solid red")
        }else{
            $("#password").css("border","1px solid green")
            $("#c_password").css("border","1px solid green")
        }
        // if(this.value ===)
    })
})