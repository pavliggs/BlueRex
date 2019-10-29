$(window).on('load', function() {
	$('.preloader').delay(500).fadeOut('slow', function() {
		$(this).attr('style', 'display: none !important');
	});
});

$(window).scroll(function() {
	var ratio = ($(document).scrollTop() / ($(document).height() - $(window).height())) * 100;
	$('#progress-bar').css('width', ratio + '%');

	if ($(this).width() >= 768) {
		if ($(this).scrollTop() > 300) {
			$('.scrollToTop').fadeIn();
		} else {
			$('.scrollToTop').fadeOut();
		}
	} else {
		if ($(this).scrollTop() > 50) {
			$('.scrollToTop').fadeIn();
		} else {
			$('.scrollToTop').fadeOut();
		}
	}
});

$('.scrollToTop').on('click', function(e) {
	e.preventDefault();
	$('html, body').animate({scrollTop: 0}, 800);
});

