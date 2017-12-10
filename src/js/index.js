import $ from 'jquery';
import Swiper from 'swiper';
import WheelIndicator from 'wheel-indicator';
import deviceDetect from 'device-detect';
import i18next from 'i18next';
import i18nextXHRBackend from 'i18next-xhr-backend';
import {getLanguage} from './language';

const log = (val) => {
    console.log(val);
};

const OPTIONS = {
    pageScrollSpeed: 1500, // скорость прокрутки при навигации
    pageAnimationSpeed: 500, // скорость смены страницы
    apiLink: "https://app.getdrop.net/sms/send", // ссылка для отправки формы
    apiKey: "d832c74005dd455bf313d7ac2df7b4d1272959de", // API ключ
};

const DEVICE = deviceDetect().device;
const ISMOBILE = /(iphone|ipad|android)/i.test(DEVICE);

const $siteLogo = $('.site-logo');
const $mailTo = $('.mailTo');
const $mobileMenu = $('.mobileMenu');
const $mobileMenuButton = $('.js-toggle-menu');
const $backToTop = $('.backToTop');
const switcherClass = 'sendLinkForm-switcher';
const $switcher = $(`.${switcherClass}`);
const $switcherButtons = $('.sendLinkForm-switcherButton');
const $form  = $('#subscribeForm');

/**
 * Handler смены слайдов
 */
function SliderChangeHandler() {
    const {activeIndex} = this;

    switch (activeIndex) {
        case 0: {
        }
            break;
        case 2: {
            $siteLogo.addClass('white');
            $mailTo.addClass('white');
        }
            break;
        case 4: {
            $siteLogo.addClass('white');
            $mailTo.addClass('white');
        }
            break;
        default: {
            $siteLogo.removeClass('white');
            $mailTo.removeClass('white');
        }
            break;
    }

    if (activeIndex !== 0) {
        $siteLogo.removeClass('hidden');
        $mailTo.removeClass('hidden');
    } else {
        $siteLogo.addClass('hidden');
        $mailTo.addClass('hidden');
    }

    if (this.isEnd) {
        $backToTop.addClass('visible');
    } else {
        $backToTop.removeClass('visible');
    }
}

const SliderTransitionEndHandler = function () {
    const $elements = $('.swiper-slide-active').find('[data-animation]');
      setTimeout(() => {
          $elements.each(function () {
            const delay = this.dataset.delay || 0;
            const animation = this.dataset.animation || '';
            $(this).css({
                '-ms-animation-delay': `${delay}ms`,
                '-o-animation-delay': `${delay}ms`,
                '-webkit-animation-delay': `${delay}ms`,
                'animation-delay': `${delay}ms`
            });
            $(this).addClass(`animated ${animation}`);
          });
      }, 100);

};

const init = () => {



    /**
     * Настроки слайдера страниц
     * @type {Swiper$1}
     */
    const screenSlider = new Swiper ('.swiper-container', {
        direction: 'vertical',
        slidesPerView: 1,
        paginationClickable: true,
        spaceBetween: 0,
        threshold: 20,
        keyboard: true,
        mousewheel : false,
        mousewheelSensitivity: 1,
        mousewheelReleaseOnEdges: true,
        iOSEdgeSwipeDetection: true,
        speed: OPTIONS.pageAnimationSpeed,
        resistanceRatio: 0,
        hashNavigation: {
            replaceState: true,
        },
        noSwiping: true,
        navigation: false,
        pagination: {
            el: '.screenPagination',
            type: 'bullets',
            clickable: true,
            renderBullet: (index, className) => (
                `<div id="pg${index}" class="screenPagination-item ${className}">
                <div class="screenPagination-bullet" data-animation="fadeInRight" data-delay="${100 + (index * 200)}"></div>
                <div class="screenPagination-tooltip">${i18next.t(`screen.${index + 1}.name`)}</div>
             </div>`
            )
        },
        runCallbacksOnInit: true,
        on: {
            init: function() {
                setTimeout(SliderChangeHandler.bind(this), 10);
                setTimeout(SliderTransitionEndHandler.bind(this), 10);

                setTimeout(() => {
                    const $elements = $('.screenPagination-bullet, .storeLinks.desktop a');
                    $elements.each(function () {
                        const delay = this.dataset.delay || 0;
                        const animation = this.dataset.animation || '';
                        $(this).css({
                            '-ms-animation-delay': `${delay}ms`,
                            '-o-animation-delay': `${delay}ms`,
                            '-webkit-animation-delay': `${delay}ms`,
                            'animation-delay': `${delay}ms`
                        });
                        $(this).addClass(`animated ${animation}`);
                    });
                }, 100);

            }
        }
    });

    screenSlider.on('slideChangeTransitionStart', SliderChangeHandler);
    screenSlider.on('slideChangeTransitionEnd', SliderTransitionEndHandler);


    let lock = false;
    let lockTimer = 0;

    /**
     * Handler колеса мыши
     */
    new WheelIndicator({
        elem: document.querySelector('body'),
        preventMouse: true,
        callback: (event) => {
            if (event.direction === 'down'){
                if (!lock)
                    screenSlider.slideNext();
            }
            else {
                if (!lock)
                    screenSlider.slidePrev();
            }

            lock = true;

            clearTimeout(lockTimer);

            lockTimer = setTimeout(() => {
                lock = false;
            }, 300);
        }
    });


    /**
     * Обработка анимации для возврата к первому экрану
     * @param event
     */
    const backToTop = (event) => {

        event.preventDefault();

        screenSlider.slideTo(0, OPTIONS.pageScrollSpeed);

    };


    /**
     * Возврат к первому слайду по клику по логотипу
     */
    $siteLogo.click(backToTop);


    /**
     * Кнопка возврата к первому слайду
     */
    $backToTop.click(backToTop);


    /**
     * Переключение типа формы
     */
    $switcherButtons.click((event) => {

        event.preventDefault();

        $switcherButtons.removeClass('active');

        const {target} = event;
        const type = $(target).data('type');

        $(`div.${type}`).addClass('active');

        $switcher.attr('class', `${switcherClass} ${type}`);

        $(target).addClass('active');

        $('[class^="field"]').removeClass('active');
        $(`.field-${type}`).addClass('active');

        $form.attr('data-type', type);

    });

    /**
     * Отправка формы
     */
    let messageTimeout = 0;

    $form.submit((event) => {

        const setSubmitMessage = (text, error = false) => {
            const $sbmMessage = $('.submitMessage');

            if (error) {
                $sbmMessage.addClass('error');
            } else {
                $sbmMessage.removeClass('error');
            }

            $sbmMessage.text(text).addClass('showed');

            clearTimeout(messageTimeout);

            messageTimeout = setTimeout(() => {
                $sbmMessage.removeClass('showed');
            }, 3000);
        };

        const lockForm = (lock = true) => {
            if (lock) {
                $(target).find('input, button').attr('disabled', true);
            } else {
                $(target).find('input, button').removeAttr('disabled');
            }
        };

        const request = (params) =>
            new Promise((resolve, reject) => {
                $.ajax({
                    ...params,
                    success: resolve,
                    error: reject
                });
            });

        event.preventDefault();

        const {target} = event;
        const phone = $form.find('[name="phone"]').val();
        const email = $form.find('[name="email"]').val();
        let value = '';

        lockForm();

        switch (target.dataset.type) {
            case 'email': {
                const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                if (!email) {
                    setSubmitMessage(i18next.t('errors.empty_email'), true);
                    lockForm(false);
                    return;
                }

                if (!regex.test(email)) {
                    setSubmitMessage(i18next.t('errors.wrong_email'), true);
                    lockForm(false);
                    return;
                }

                value = email;

            }
                break;
            default: {
                if (!phone|| phone === '+7' || phone === '+1') {
                    setSubmitMessage(i18next.t('errors.empty_phone'), true);
                    lockForm(false);
                    return;
                }

                if (!/[\d]{9,14}/.test(phone)) {
                    setSubmitMessage(i18next.t('errors.wrong_phone'), true);
                    lockForm(false);
                    return;
                }

                value = phone.match(/[\d]/g).join('');

            }
                break;
        }

        const params = {
            url: OPTIONS.apiLink,
            type: 'POST',
            dataType: 'json',
            data: {
                apiKey: OPTIONS.apiKey,
                phone: value
            }
        };

        request(params)
            .then((data) => {
                if (data.success){
                    setSubmitMessage(i18next.t('messages.success'));
                    $form.find('input').val('');
                }
                else {
                    setSubmitMessage(i18next.t('messages.other'), true);
                }
            })
            .catch(() => {
                setSubmitMessage(i18next.t('errors.other'), true);
            })
            .then(() => {
                lockForm(false);
            });

        return false;

    });




    if (ISMOBILE) {

        /**
         * Мобильное меню
         */

        const $mobileMenulist = $('#mobileMenu');
        const $slides = $('.swiper-slide');

        $slides.each((i) => {
            $mobileMenulist.append(`<li class="js-mobile-link" data-id="${i}">${i18next.t(`screen.${i + 1}.name`)}</li>`);
        });

        $('.js-mobile-link').click(({target}) => {

            const {id} = target.dataset;

            $mobileMenu.removeClass('open');

            setTimeout(() => {
                screenSlider.slideTo(id, OPTIONS.pageScrollSpeed);
            }, 400);

        });


        $mobileMenuButton.click((event) => {

            event.preventDefault();

            $mobileMenu.toggleClass('open');

        });

        $('.js-mobileMenu-close').click((event) => {

            event.preventDefault();

            $mobileMenu.removeClass('open');

        });

        if (/android/i.test(DEVICE)) {
            $('.googlePlayButton').removeClass('hidden');
        }

        if (/(iphone|ipad)/i.test(DEVICE)) {
            $('.appleStoreButton').removeClass('hidden');
        }

    }

};

/**
 * Localization
 */

const setLocalization = () => {

    const fields = document.querySelectorAll('[data-local]');

    fields.forEach((field) => {

        const trsKey = field.dataset.local;

        field.innerHTML = i18next.t(trsKey);

    });

    const placeholders = document.querySelectorAll('[data-local-placeholder]');

    placeholders.forEach((field) => {

        const trsKey = field.dataset.localPlaceholder;

        field.placeholder = i18next.t(trsKey);

    });

    const valuesFields = document.querySelectorAll('[data-local-value]');

    valuesFields.forEach((field) => {

        const trsKey = field.dataset.localValue;

        field.value = i18next.t(trsKey);

    });


    document.title = i18next.t('title');

};

const lng = getLanguage();
const RU = require('../locales/ru/translation.json');
const EN = require('../locales/en/translation.json');

i18next
    .use(i18nextXHRBackend)
    .init({
        load: 'languageOnly',
        detection: {
            caches: ['cookie'],
        },
        lng: 'en',
        fallbackLng: ['en'],
        preload: ['en'],
        debug: false,
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
            parse: (data) => data,
            ajax: (url, options, callback, data) => {
                switch (lng) {
                    case 'ru':
                        return callback(RU, {status: '200'});
                    default:
                        return callback(EN, {status: '200'});
                }
            }
        }
    }, function(err, t) {
        // init set content
        if (!err) {
            setLocalization();
            init();
        }
    });


