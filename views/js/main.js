$(function() {
    // constants
    var SHOW_CLASS = 'show',
        HIDE_CLASS = 'hide',
        ACTIVE_CLASS = 'active';

    $("input[name='passwordConf']").keyup(checkPasswordMatch);
         
    $('.tabs').on('click', 'li a', function(e) {
        e.preventDefault();
        var tab = $(this),
            href = $tab.attr('href');
        $('.active').removeClass(ACTIVE_CLASS);
         tab.addClass(ACTIVE_CLASS);
        $('.show').removeClass(SHOW_CLASS).addClass(HIDE_CLASS).hide();
        $(href).removeClass(HIDE_CLASS).addClass(SHOW_CLASS).hide().fadeIn(620);
    });


       /*Password Strength meter */
    $('input[name="passwordreg"]').keyup(function (e) {
        var strongRegex = new RegExp("^(?=.{15,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
        var includeCapsRegex = new RegExp("^(?=.{14,})(?=.*[a-z0-9])(?=.*\\W).*$", "g");
        var complexCharRegex = new RegExp("^(?=.{10,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).*$", "g");
        var enoughRegex = new RegExp("(?=.{13,}).*", "g");
        if (false == enoughRegex.test($(this).val())) {
            $('#passtrength').html('Add More Characters');
        } else if (strongRegex.test($(this).val())) {           
            $('#passtrength').html('Strong!');
        } else if (includeCapsRegex.test($(this).val())) {
            $('#passtrength').className = 'alert';
            $('#passtrength').html('include  Capital Letters!');
        } else if (complexCharRegex.test($(this).val())) {
            $('#passtrength').html('include characters like (#,@,%,&)!');
        }
        else {
            $('#passtrength').className = 'error';
            $('#passtrength').html('requires Capitals ,complexCharacters(@,#),numbers!');
        }
        return true;
    });

    var $email =$('input[name="email"]');
    var $password=$('input[name="password"]');
    var $phone =$('input[name="phone"]');
    var $username=$('input[name="name"]');
    var $passwordConfirm =$('input[name="passwordConf"]');

     $('input[value="Login"]').on('click' , function(){
        if($email!=""&& $password!=""){

          var member={
          email: $email.val(),
          password: $password.val()
        };

        $.ajax({
           type: 'POST',
           url: 'http://localhost:3000/users/login',
           data: member, 
           success: function(){
             alert("successfully logged in");
           },
           error:function(){
             alert("error logging In");
           }
            
        });
      }

      else{
        alert("user details required")
      }
       

     });
      
    var $emailreg =$('input[name="emailreg"]');
    var $passwordreg=$('input[name="passwordreg"]');

     $('input[value="Sign Up"]').on('click' , function(){

      if($emailreg!="" && $passwordreg!="" && $username!=""&& $phone!="" && $passwordConfirm!=""){

          var signReg={
          email: $emailreg.val(),
          username: $username.val(),
          password: $passwordreg.val(),
          passwordConf: $passwordConfirm.val(),
          phone: $phone.val()
        };

        $.ajax({

           type: 'POST',
           url: 'http://localhost:3000/users/signUp',
           data: signReg, 
           dataType: "json",
           cache: false,
           success: function(){
             alert("successfully reqistered");
           },
           error:function(){
             alert("error registering");
           }           
        });
      }

      else{
        alert("fill all the details")
      }

    });
    

});

function checkPasswordMatch() {
        var password = $("input[name='passwordreg']").val();
        var confirmPassword = $("input[name='passwordConf']").val();

        if (password != confirmPassword)
            $("#divCheckPasswordMatch").html("Passwords do not match!");
        else
            $("#divCheckPasswordMatch").html("Passwords match.");
    }

function validateEmail(emailField) {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        if (reg.test(emailField.value) == false) {
            alert('Invalid mail Address');
            return false;
        }

        return true;
    }

    function validatePhone(phoneField) {
        var reg = /^(\+?[0-9]{7,45})*$/;

        if (reg.test(phoneField.value) == false) {
            alert('Invalid Phone Number');
            return false;
        }

        return true;
    }