/* global tinyMCE */
(function($){
    var media = wp.media,
        typingTimer,
        shortcode_string = 'yamaps';

    wp.mce = wp.mce || {};

    wp.mce.cd_ya_maps = {
        shortcode_data: {},
        getContent: function() {
            // Контент внутри объекта
            return '<p style="text-align: center;">[Yandex Карта]</p>';
        },
        edit: function( data ) {
            var shortcode_data = wp.shortcode.next(shortcode_string, data);
            var values = shortcode_data.shortcode.attrs.named;
            values.address = 'Оставьте пустым, если не хотите изменять';

            wp.mce.cd_ya_maps.popupwindow(tinyMCE.activeEditor, values);
        },
        popupwindow: function(editor, values, body_type){
            values = values || [];
            if( typeof onsubmit_callback !== 'function' ) {
                onsubmit_callback = function( e ) {
                    // Insert content when the window form is submitted
                    var args = {
                            tag     : shortcode_string,
                            type    : 'single',
                            attrs : {
                                title : e.data.title,
                                coords : values.coords
                            }
                        };

                    if( e.data.zoom && e.data.zoom != '12' ) {
                        args.attrs.zoom = e.data.zoom;
                    }

                    if( e.data.height && e.data.height != '400' ) {
                        args.attrs.height = e.data.height;
                    }

                    editor.insertContent( wp.shortcode.string( args ) );
                };
            }

            editor.windowManager.open( {
                title: 'Yandex Карта',
                body: [
                {
                    type: 'textbox',
                    name: 'address',
                    label: 'Введите адреc',
                    value: values.address,
                    onkeyup: function(e) {
                        clearTimeout(typingTimer);
                        typingTimer = setTimeout(function(){
                            if( e.target.value ) {
                                var ajaxdata = {
                                    action: 'AJAX_ACTION_NAME',
                                    // nonce: AJAX_VAR.nonce,
                                    value: e.target.value
                                };

                                $.post(ajaxurl, ajaxdata, function(data, textStatus, xhr) {
                                    var data = JSON.parse( data );

                                    e.target.value = data.address;
                                    values.coords  = data.coordinates[0] + ' ' + data.coordinates[1];
                                });
                            }
                        }, 5000);
                    },
                    onkeydown: function(e) {
                        clearTimeout(typingTimer);
                    }
                },
                {
                    type: 'textbox',
                    name: 'title',
                    label: 'Заголовок',
                    value: values.title,
                },
                {
                    type: 'textbox',
                    name: 'zoom',
                    label: 'Увеличение',
                    value: values.zoom || 12,
                },
                {
                    type: 'textbox',
                    name: 'height',
                    label: 'Высота блока',
                    value: values.height || 400
                }
                ],
                onsubmit: onsubmit_callback
            } );
        }
    };

    wp.mce.views.register( shortcode_string, wp.mce.cd_ya_maps );

}(jQuery));