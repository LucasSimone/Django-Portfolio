const recaptcha_key = JSON.parse(document.getElementById('recaptcha-key').textContent);

// document.addEventListener('DOMContentLoaded', () => {
//     document.getElementsByTagName('form').addEventListener('submit', async (e) => {
//         // Prevent the default form submission behaviour
//         e.preventDefault();
//         console.log(e);
//         try {
//             const token = await grecaptcha.execute(recaptcha_key, { action: 'login' });
//             document.getElementById('id_recaptcha').value = token;
//             // Submit the form with the reCAPTCHA token
//             document.getElementById('loginForm').submit(); 
//         } catch (error) {
//             // Handle any errors
//             console.error('Error obtaining reCAPTCHA token:', error);
//             document.getElementById('non_field_errors').textContent = 'reCAPTCHA validation failed. Please try again.';
//         }
//     });
// });


$( document ).ready(function() {
    $("form").on("submit", async function( event ) {
        event.preventDefault();
        try {
            console.log(typeof recaptcha_key);
            const token = await grecaptcha.execute(recaptcha_key, { action: event.currentTarget.dataset.recaptchaAction});
            console.log($(event.currentTarget).find( "#id_recaptcha" )[0]);
            $(event.currentTarget).find( "#id_recaptcha" ).val(token)
            event.currentTarget.submit();
        } catch (error) {
            // Handle any errors
            console.error('Error obtaining reCAPTCHA token:', error);
            document.getElementById('non_field_errors').textContent = 'reCAPTCHA validation failed. Please try again.';
        }
    });
});