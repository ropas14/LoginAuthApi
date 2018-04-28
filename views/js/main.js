$(function() {
    // constants
    var SHOW_CLASS = 'show',
        HIDE_CLASS = 'hide',
        ACTIVE_CLASS = 'active';
    $('.tabs').on('click', 'li a', function(e) {
        e.preventDefault();
        var tab = $(this),
            href = $tab.attr('href');
        $('.active').removeClass(ACTIVE_CLASS);
         tab.addClass(ACTIVE_CLASS);
        $('.show').removeClass(SHOW_CLASS).addClass(HIDE_CLASS).hide();
        $(href).removeClass(HIDE_CLASS).addClass(SHOW_CLASS).hide().fadeIn(620);
    });

    var $email =$('input[name="email"]');
    var $password=$('input[name="password"]');
    var $phone =$('input[name="phone"]');
    var $name=$('input[name="name"]');
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
           success: function(name){
             alert("successfully logged in" + name.email);
           },
           error:function(){
             alert("error logging In");
           },
            dataType: "json"
        });
      }

      else{
        alert("user details required")
      }
       

     });
      
    var $emailreg =$('input[name="emailreg"]');
    var $passwordreg=$('input[name="passwordreg"]');

     $('input[value="Sign Up"]').on('click' , function(){

      if($emailreg!="" && $passwordreg!="" && $name!=""&& $phone!="" && $passwordConfirm!=""){

          var register={
          email: $emailreg.val(),
          username: $name.val(),
          password: $passwordreg.val(),
          passwordConf: $passwordConfirm.val(),
          phone: $phone.val()
        };

        $.ajax({

           type: 'POST',
           url: 'http://localhost:3000/users/signUp',
           data: register, 
           success: function(){
             alert("successfully reqistered");
           },
           error:function(){
             alert("error registering");
           },
           dataType: "json"
        });
      }

      else{
        alert("fill all the details")
      }

    });
    



});

// initialize the validator function
      var validator = new FormValidator();
      
      // validate a field on "blur" event, a 'select' on 'change' event &amp; a '.reuired' classed multifield on 'keyup':
      $('form').on('blur', 'input[required], input.optional, select.required', validator.checkField).on('change', 'select.required', validator.checkField).on('keypress', 'input[required][pattern]', validator.keypress);
      $('.multi.required').on('keyup blur', 'input', function() {
          validator.checkField.apply($(this).siblings().last()[0]);
      });
      // bind the validation to the form submit event
      //$('#send').click('submit');//.prop('disabled', true);
      $('form').submit(function(e) {
          e.preventDefault();
          var submit = true;
          // evaluate the form using generic validaing
          if (!validator.checkAll($(this))) {
              submit = false;
          }
          if (submit) this.submit();
          return false;
      });