Clouder.run = function($){
    Clouder.$ = $;
    Clouder.$plugin = Clouder.$('#ClouderPlugin');
    Clouder.login_validated = false;

    Clouder.$plugin.css('background', 'none');
    Clouder.$plugin.find('.CL_final_thanks').hide();
    Clouder.$plugin.find('.CL_final_error').hide();
    Clouder.$plugin.find('.CL_Loading').hide();
    
    $('#ClouderForm').each(function(){
        $clouder_form = $(this);

        // Hide hint
        $clouder_form.find('.CL_hint').hide();

        // Hide instance title
        $clouder_form.find('input[name="title"]').parent().hide();

        // Env input
        $clouder_form.find('select[name="env_id"]').parent().hide();
        $clouder_form.find('#CL_env_form').hide();

        // Show step 1 by default
        Clouder.showStep(1);

        // Fill form data with already known variables
        $clouder_form.attr('action', Clouder.pluginPath + 'submit_form');
        $clouder_form.find('input[name="clouder_partner_id"]').val(Clouder.params['partner_id']);
        $clouder_form.find('input[name="db"]').val(Clouder.params['db']);
        $clouder_form.find('input[name="lang"]').val(Clouder.params['lang']);

        // Controls the state of env_prefix input depending on env_id
        $clouder_form.on('change', "select[name='env_id']", function(){
            var $env_id = $clouder_form.find('select[name="env_id"]');
            var $env_prefix = $clouder_form.find('input[name="env_prefix"]');
            if (Clouder.login_validated && $env_id.val()){
                $env_prefix.attr('readonly', true);
                $env_prefix.attr('disabled', true);
                $env_prefix.val('');
            }
            else {
                $env_prefix.attr('readonly', false);
                $env_prefix.attr('disabled', false);
            }
        });
        $clouder_form.find('select[name="env_id"]').change();

        // Controls the appearance of env/title inputs depending on application_id
        $clouder_form.on('change', "select[name='application_id']", function(){
            var $app_id = $clouder_form.find("select[name='application_id']");
            var $env_div = $clouder_form.find('#CL_env_form');
            var $title_input = $clouder_form.find('input[name="title"]');
            if ($app_id.find('option:selected').attr('inst_type')==='container'){
                $env_div.show();
                $title_input.parent().hide();
            }
            else if ($app_id.find('option:selected').attr('inst_type')==='base'){
                $env_div.hide();
                $title_input.parent().show();
            }
            else {
                $env_div.hide();
                $title_input.parent().hide();
            }
        });
        $clouder_form.find('select[name="application_id"]').change();

        // Controls the hidden state of the password input depending on email
        $clouder_form.on('change', "input[name='email']", function(){
            // Invalidate login
            Clouder.login_validated = false;
            $clouder_form.find('select[name="env_id"]').parent().hide();

            var $email = $clouder_form.find("input[name='email']");
            var $passwd = $clouder_form.find("input[name='password']");

            Clouder.user_login($email, $passwd, function(result){
                if (result.res){
                    $passwd.parent().addClass('js_required');
                    $passwd.parent().show();
                }
                else {
                    $passwd.parent().removeClass('js_required');
                    $passwd.parent().hide();
                }
            });
        });
        $clouder_form.find("input[name='email']").change();

        // Launch login if password is changed
        $clouder_form.on('change', 'input[name="password"]', function(){
            // Invalidate login
            Clouder.login_validated = false;

            // Hide and empty env selection
            $clouder_form.find('select[name="env_id"]').parent().hide();
            $clouder_form.find('select[name="env_id"]').find('option:gt(0)').remove();

            var $email = $clouder_form.find("input[name='email']");
            var $passwd = $clouder_form.find("input[name='password']");

            if ($passwd.parent().hasClass('js_required') && $passwd.val()){
                Clouder.user_login($email, $passwd, function(result){
                    var $hint = Clouder.$plugin.find('.CL_hint');

                    if (result.res){
                        $passwd.parent().removeClass('has-error');
                        $hint.hide();
                        Clouder.login_validated = true;
                        $clouder_form.find('select[name="env_id"]').parent().show();
                    }
                    else {
                        $passwd.parent().addClass('has-error');
                        $hint.text = "Invalid password.";
                        $hint.show();
                    }
                });
            }
        });

        // Controls the hidden state of the state selector depending on country
        $clouder_form.on('change', "select[name='country_id']", function () {
            var $select = $clouder_form.find("select[name='state_id']");
            $select.find("option:not(:first)").hide();
            var nb = $select.find("option[country_id="+($(this).val() || 0)+"]").show().size();
            $select.parent().toggle(nb>1);
        });
        $clouder_form.find("select[name='country_id']").change();

        // Buttons handlers
        $clouder_form.find('.a-next').off('click').on('click', function () {
            Clouder.error_step(1);
        });

        $clouder_form.find('.a-prev').off('click').on('click', function () {
            Clouder.showStep(1);
        });
        $clouder_form.find('.a-submit').off('click').on('click', function () {
            Clouder.error_step(2);
        });
        Clouder.$plugin.find('.a-retry').off('click').on('click', function(){
            Clouder.$plugin.find('.CL_final_error').hide();
            Clouder.loading(true);
            Clouder.showStep(1);
            Clouder.loading(false);
        });

        // Resize and handle divs
        $clouder_form.find('fieldset').each(function(){
            var col = 0;
            $(this).find('div').each(function(){
                if ($(this).hasClass('clearfix')){
                    col = 0;
                }
                else if ($(this).hasClass('form-group')){
                    if (col % 2 === 0){
                        $(this).css('float', 'left');
                    }
                    else{
                        $(this).css('float', 'right');
                    }
                    col = col + 1;
                }
            });
        });
    });
};

Clouder.loading = function(state){
    var $loading = Clouder.$plugin.find('.CL_Loading');
    var $form = Clouder.$plugin.find('#ClouderForm');
    if (state){
        $loading.css('background', 'black url('+Clouder.img_loading+') no-repeat center center');
        $loading.css('height', $form.height());
        $loading.css('width', $form.width());
        $form.hide();
        Clouder.$plugin.find('.CL_hint').hide();
        $loading.show();
    }
    else {
        $loading.css('background', '');
        $loading.hide();
        $form.show();
    }
}

Clouder.submit_override = function(){
    var $form = Clouder.$plugin.find('#ClouderForm');

    Clouder.loading(true);

    // Empty env values if application type is not container
    $app_id = $form.find('select[name="application_id"]');
    $env_id = $form.find('select[name="env_id"]');
    $env_prefix = $form.find('input[name="env_prefix"]');
    if ($app_id.find('option:selected').attr('inst_type')!=='container'){
        $env_id.val('');
        $env_prefix.val('');
    }

    Clouder.$.ajax({
        url: $form.attr('action'),
        data: $form.serialize(),
        method: 'POST',
        cache: false,
        dataType: 'html',
        success: function(data) {
            data = JSON.parse(data);
            if (data.html){
                Clouder.$plugin.append('<div id="'+data.div_id+'"></div>');
                $new_div = Clouder.$plugin.find('#'+data.div_id)
                $new_div.html(data.html);
                Clouder.loading(false);
                $form.hide();
                $new_div.show();
            }
            else {
                Clouder.loading(false);
                $form.hide();
                $error = Clouder.$plugin.find('.CL_final_error');
                $error.find('.CL_Error_msg').text('ERROR: Did not understand server response');
                $error.show();
            }
        },
        error: function(jq, txt, err) {
            Clouder.loading(false);
            $form.hide();
            $error = Clouder.$plugin.find('.CL_final_error');
            $error.find('.CL_Error_msg').text('ERROR: Could not submit form');
            $error.show();
        }
    });
}

Clouder.add_error_to_elt = function($elt){
    var err_class = "has-error";
    if (!$elt.val())
    {
        $elt.parent().addClass(err_class);
        return true;
    }
    $elt.parent().removeClass(err_class);
    return false;
};

Clouder.error_email = function($elt){
    var email = $elt.val();
    var err_class = "has-error";
    var $hint = Clouder.$plugin.find('.CL_hint');
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email == '' || !re.test(email))
    {
        $elt.parent().addClass(err_class);
        $hint.text('Please enter a valid email address');
        return true;
    }
    $elt.parent().removeClass(err_class);
    return false;
};

Clouder.error_step = function(step){
    var has_error = false;
    var $hint = Clouder.$plugin.find('.CL_hint');
    $hint.text('');
    $hint.hide();

    if (step == 1){
        $app_select = Clouder.$plugin.find('select[name="application_id"]');
        $domain_select = Clouder.$plugin.find('select[name="domain_id"]');
        $prefix_input = Clouder.$plugin.find('input[name="prefix"]');
        $password_select = Clouder.$plugin.find('input[name="password"]');
        $email_select = Clouder.$plugin.find('input[name="email"]');
        
        has_error = Clouder.add_error_to_elt($app_select) || has_error;
        has_error = Clouder.add_error_to_elt($domain_select) || has_error;
        has_error = Clouder.add_error_to_elt($prefix_input) || has_error;
        has_error = Clouder.error_email($email_select) || has_error;

        if ($app_select.find('option:selected').attr('inst_type')==='container'){
            $env_prefix = Clouder.$plugin.find('input[name="env_prefix"]');
            $env_id = Clouder.$plugin.find('select[name="env_id"]');

            if (!$env_id.val() && !$env_prefix.val()){
                has_error = true;
                $env_id.parent().addClass('has-error');
                $env_prefix.parent().addClass('has-error');
            }
            else {
                $env_id.parent().removeClass('has-error');
                $env_prefix.parent().removeClass('has-error');
            }
        }
        else if ($app_select.find('option:selected').attr('inst_type')==='base'){
            $title_input = Clouder.$plugin.find('input[name="title"]');
            has_error = Clouder.add_error_to_elt($title_input) || has_error;
        }

        if (has_error){
            if (!$hint.text()){
                $hint.text("Please fill in the required fields.");
            }
            $hint.show();
        }

        if ($password_select.parent().hasClass('js_required')){
            has_error = Clouder.add_error_to_elt($password_select) || has_error;
            has_error = !Clouder.login_validated || has_error;
            if (!Clouder.login_validated){
                $hint.text("Invalid password for registered user.");
                $hint.show();
            }
        }

        // If there's no error after all that, we can proceed
        if (!has_error){
            Clouder.showStep(2);
        }
    }
    else if (step == 2){
        $name_select = Clouder.$plugin.find('input[name="name"]');
        $phone_select = Clouder.$plugin.find('input[name="phone"]');
        $street2_select = Clouder.$plugin.find('input[name="street2"]');
        $city_select = Clouder.$plugin.find('input[name="city"]');
        $country_select = Clouder.$plugin.find('select[name="country_id"]');

        has_error = Clouder.add_error_to_elt($name_select) || has_error;
        has_error = Clouder.add_error_to_elt($phone_select) || has_error;
        has_error = Clouder.add_error_to_elt($street2_select) || has_error;
        has_error = Clouder.add_error_to_elt($city_select) || has_error;
        has_error = Clouder.add_error_to_elt($country_select) || has_error;

        if (!has_error){
            Clouder.submit_override();
        }
        else {
            $hint.text("Please fill in the required fields.");
            $hint.show();
        }
    }

    if (!has_error){
        $hint.hide();
    }
};

/*
    Sets the env_id options for the given registered user
*/
Clouder.get_env = function($login, $password, when_callback){
    // Put the form in loading mode
    Clouder.loading(true);

    // Declare vars
    var result = {'res': false, 'error': false};

    function ajax_get_env(){
        return Clouder.$.ajax({
            url: Clouder.pluginPath + 'get_env',
            data: {
                'login': $login.val(),
                'password': $password.val(),
                'db': Clouder.params['db'],
                'lang': Clouder.params['lang']
            },
            method:'POST',
            cache: false,
            dataType: 'html',
            success: function(data) {
                result.res = JSON.parse(data).result;
            },
            error: function(jq, txt, err) {
                result.error = "Error: failed to get environment information";
            }
        });
    };

    if ($login.val()){
        Clouder.$.when(ajax_get_env()).always(function(useless){
            when_callback(result);
            Clouder.loading(false);
        });
    }
    else {
        // Hide password and empty value
        $password.parent().removeClass('js_required');
        $password.val('');
        $password.parent().hide();
        Clouder.loading(false);
    }

}

/*
    If login is passed: returns true if the login exists
    If login and password are passed: return true if you can authenticate on the DB with these
*/
Clouder.user_login = function($login, $password, when_callback){
    // Put the form in loading mode
    Clouder.loading(true);

    // Declare vars
    var result = {'res': false, 'error': false};

    function axaj_login(){
        return Clouder.$.ajax({
            url: Clouder.pluginPath + 'form_login',
            data: {'login': $login.val(), 'password': $password.val(), 'db': Clouder.params['db']},
            method:'POST',
            cache: false,
            dataType: 'html',
            success: function(data) {
                result.res = JSON.parse(data).result;
            },
            error: function(jq, txt, err) {
                if ($password.val()){
                    result.error = "Error: failed to connect to login server.";
                }
                else {
                    result.error = "Error: could not determine if "+$login.val()+" is already registered.";
                }
            }
        });
    };

    if ($login.val()){
        Clouder.$.when(axaj_login()).always(function(useless){
            when_callback(result);
            Clouder.loading(false);
            if (result.res && $password.val()){
                Clouder.get_env($login, $password, function(data){
                    var first = true;
                    $hint = Clouder.$plugin.find('.CL_hint');
                    if (data.res){
                        for(env_id in data.res){
                            $env_select = Clouder.$plugin.find('select[name="env_id"]');

                            // Add option for each env
                            $env_select.append('<option value="'+env_id+'">'+data.res[env_id]['name']+'</option>');

                            // Select the first added env
                            if (first){
                                first = false;
                                $env_select.val(env_id);
                            }
                            $env_select.parent().show();
                            $env_select.change();
                        }
                    }
                    else {
                        if (data.error){
                            $hint.text = error;
                        }
                        else {
                            $hint.text = "Unknown error: could not load existing environments.";
                        }
                        $hint.show();

                        $env_select.parent().hide();
                        $env_select.change();
                    }
                });
            }
        });
    }
    else {
        // Hide password and empty value
        $password.parent().removeClass('js_required');
        $password.val('');
        $password.parent().hide();
        Clouder.loading(false);
    }

}

// Displays the right elements, corresponding to the current step. Hides the others.
Clouder.showStep = function(step){
    Clouder.$plugin.find('.CL_Step').hide();
    Clouder.$plugin.find('.CL_Step'+step).show();
};

// Loads JQuery plugins and sets default values
Clouder.loadJQueryPlugins = function() {
    jQuery.noConflict(); // Avoid conflicts between our JQuery and the possibly existing one
    jQuery(document).ready(function($) {
        Clouder.params.langShort = Clouder.params.lang.split('_')[0];
        // Loads the form content in the ClouderPlugin div and launches the javascript
        Clouder.loadPhp($);
    });
};

Clouder.img_loading = Clouder.pluginPath + "img/loading32x32.gif"

Clouder.loadPhp = function ($) {
    $('#ClouderPlugin').css('min-height', '52px');
    $.ajax({
        url: Clouder.pluginPath + 'request_form',
        data: Clouder.params,
        method:'POST',
        dataType: 'html',
        cache: false,
        success: function(data) {
            $('#ClouderPlugin').html(data);
            Clouder.run($);
        },
        error: function(jq, txt, err) {
            $('#ClouderPlugin').html("ERROR: Could not load form")
        }
    });
};

// Loads and external javascript and launches a function if successful
Clouder.getScript = function (url, success) {
    var script = document.createElement('script');
    script.src = url;
    var head = document.getElementsByTagName('head')[0],
    done = false;

    script.onload = script.onreadystatechange = function() {
        if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
        done = true;
            // Launch the argument-given function
            success();
            script.onload = script.onreadystatechange = null;
            head.removeChild(script);
        };
    };
    head.appendChild(script);
};

// Loads jQUeryUi if it's not done already
Clouder.getJqueryUi = function() {
    if (typeof jQuery.ui == 'undefined') {
        jQuery("head").append("<link rel='stylesheet' type='text/css' href='//ajax.googleapis.com/ajax/libs/jqueryui/1/themes/south-street/jquery-ui.min.css' />");
        Clouder.getScript('//ajax.googleapis.com/ajax/libs/jqueryui/1/jquery-ui.min.js', function() {
            Clouder.loadJQueryPlugins();
        });
    }else{
        Clouder.loadJQueryPlugins();
    }
};



// The following part launches the bootstrap sequence

// Loads jQuery if it's not loaded already
if (typeof jQuery == 'undefined') {
    Clouder.getScript('//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js', function() {
        // Loading the rest inside the newly loaded jQuery
        Clouder.getJqueryUi();
    });
} else {
    // Loading the rest on the already loaded jQuery
    Clouder.getJqueryUi();
};