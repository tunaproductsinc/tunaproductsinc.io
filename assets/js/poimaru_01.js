$(function () {
    $(".header__spmenu").on('click', function () {
        $(this).toggleClass('active');
        $(".nav").toggleClass('panelactive');
        $(".l-header").toggleClass('active_mode');
    });

if($('.header__spmenu').css('display') == 'none'){
        $(document).on({
        "mouseenter": function(){
            $(this).children('ul').fadeIn();
        },
        "mouseleave": function(){
            $(this).children('ul').hide();
        }
        }, ".subnavip");
    }else{
        $(".subnavipa").on('click', function () {
            $(this).parent('li').toggleClass('active');
            $(this).parent('li').children('ul').toggleClass('active');
            return false;
        });
    }

$(window).on('load scroll', function () {
        $('.fadein').each(function () {
            var elemPos = $(this).offset().top;
            var scroll = $(window).scrollTop();
            var windowHeight = $(window).height();
            if (scroll > elemPos - windowHeight + 100) {
                $(this).addClass('scrollin');
            }
        });
    });
    $('a[href^="#"]').on('click', function () {
        var href = $(this).attr("href");
        var target = $(href == "#" || href == "" ? 'html' : href);
        var position = target.offset().top + 0;
        $('body,html').animate({
            scrollTop: position
        }, 400, 'swing');
        return false;
    });
});