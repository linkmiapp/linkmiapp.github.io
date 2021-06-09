/*
	Twenty by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {
  var $window = $(window),
    $body = $('body'),
    $header = $('#header'),
    $banner = $('#banner');

  // Breakpoints.
  breakpoints({
    wide: ['1281px', '1680px'],
    normal: ['981px', '1280px'],
    narrow: ['841px', '980px'],
    narrower: ['737px', '840px'],
    mobile: [null, '736px'],
  });

  // Play initial animations on page load.
  $window.on('load', function() {
    window.setTimeout(function() {
      $body.removeClass('is-preload');
    }, 100);
  });

  // Scrolly.
  $('.scrolly').scrolly({
    speed: 1000,
    offset: function() {
      return $header.height() + 10;
    },
  });

  // Dropdowns.
  $('#nav > ul').dropotron({
    mode: 'fade',
    noOpenerFade: true,
    expandMode: browser.mobile ? 'click' : 'hover',
  });

  // Nav Panel.

  // Button.
  $(
    '<div id="navButton">' +
      '<a href="#navPanel" class="toggle"></a>' +
      '</div>',
  ).appendTo($body);

  // Panel.
  $('<div id="navPanel">' + '<nav>' + $('#nav').navList() + '</nav>' + '</div>')
    .appendTo($body)
    .panel({
      delay: 500,
      hideOnClick: true,
      hideOnSwipe: true,
      resetScroll: true,
      resetForms: true,
      side: 'left',
      target: $body,
      visibleClass: 'navPanel-visible',
    });

  // Fix: Remove navPanel transitions on WP<10 (poor/buggy performance).
  if (browser.os == 'wp' && browser.osVersion < 10)
    $('#navButton, #navPanel, #page-wrapper').css('transition', 'none');

  // Header.
  if (!browser.mobile && $header.hasClass('alt') && $banner.length > 0) {
    $window.on('load', function() {
      $banner.scrollex({
        bottom: $header.outerHeight(),
        terminate: function() {
          $header.removeClass('alt');
        },
        enter: function() {
          $header.addClass('alt reveal');
        },
        leave: function() {
          $header.removeClass('alt');
        },
      });
    });
  }

  $(document).ready(function() {
    $('#navPanel nav a:first-child').addClass('manualModal');
    $('.manualModal').on('click', function() {
      $('#navButton').click();
      $('#signUp').modal('show');
    });

    firebase.initializeApp({
      apiKey: "AIzaSyBUmqc2_gN3P_SWx_vX7JQrX-cN0EovqaI",
      authDomain: "linkmi-orchid.firebaseapp.com",
      projectId: "linkmi-orchid",
    });

    var db = firebase.firestore();

    $("input[name='userName']").keyup(function () {
      var normalizedValue = this.value.match(/^[a-zA-Z0-9_][a-zA-Z0-9_.]*/gm);

      $(this).val(normalizedValue);
    });

    // Initialize Firebase
    $('#contactForm, #preSignUp').submit(async function(e) {
      e.preventDefault();

      var user = null;
      var $form = $(this);
      var firstName = $form.find("input[name*='firstName']").val();
      var lastName = $form.find("input[name*='lastName']").val();
      var email = $form.find("input[name*='email']").val();
      var username = $form.find("input[name*='userName']").val();
      var submitBtn = $form.find('button:submit');
      var isUsernamePresent = username && username.trim().length > 0;
      submitBtn.prop('disabled', true);

      if (isUsernamePresent) {
        var normalizedUsername = username.trim();

        try {
          user = await db.collection('users').doc(normalizedUsername).get();
        } catch(error) {
          console.log('Error', error);
          Swal.fire({
            title: 'Oops!',
            html:
              'There was an error sending the form.<br/> Try refreshing the page.',
            icon: 'warning',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'OK',
          });
        }
      }

      if (user && user.exists) {
        Swal.fire({
          title: 'Oops!',
          html:
            'Username is already taken.<br/> Please select a different username.',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'OK',
        });
      } else {
        try {
          if (isUsernamePresent) {
            await db.collection('users').doc(normalizedUsername).set({
              firstName: firstName,
              lasttName: lastName,
              email: email,
              username: normalizedUsername,
              created: firebase.firestore.FieldValue.serverTimestamp(),
            });
          }

          $.post($form.attr('action'), $form.serialize())
            .done(function(msg) {
              $('#signUp').modal('hide');
              Swal.fire({
                title: 'Success!',
                text: isUsernamePresent ? 'Your username has been reserved' : 'Your message has been sent.',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'OK',
              }).then((result) => {
                location.reload();
              });
            })
            .fail(function(xhr, status, error) {
              if (status === 'error') {
                $('#signUp').modal('hide');
                Swal.fire({
                  title: 'Oops!',
                  html:
                    'There was an error sending the form.<br/> Try refreshing the page.',
                  icon: 'warning',
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'OK',
                });
              }
            });
        } catch (error) {
          Swal.fire({
            title: 'Oops!',
            html:
              'There was an error sending the form.<br/> Try refreshing the page.',
            icon: 'warning',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'OK',
          });
        }
      }

      submitBtn.prop('disabled', true);
    });
  });
})(jQuery);
