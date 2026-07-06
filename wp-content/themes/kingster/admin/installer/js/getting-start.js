(function($){
	"use strict";

		// create the conformation message
		window.gdlr_core_confirm_box_large = function(options){

			var settings = $.extend({
				head: gdlr_utility.confirm_head,
				text: gdlr_utility.confirm_text,
				success:  function(){}
			}, options);
			
			var confirm_overlay = $('<div class="gdlr-conform-box-overlay"></div>').appendTo($('body'));
			var confirm_button = $('<span class="gdlr-core-confirm-box-button gdlr-core-yes">' + gdlr_utility.confirm_yes + '</span>');
			var decline_button = $('<span class="gdlr-core-confirm-box-button gdlr-core-no">' + gdlr_utility.confirm_no + '</span>');
			
			var confirm_box = $('<div class="gdlr-core-confirm-box-wrapper">\
					<div class="gdlr-core-confirm-box-head">' + settings.head + '</div>\
					<div class="gdlr-core-confirm-box-content-wrapper" >\
						<div class="gdlr-core-confirm-box-text">' + settings.text + '</div>\
					</div>\
				</div>').insertAfter(confirm_overlay);
		
		
			$('<div class="gdlr-core-confirm-box-button-wrapper"></div>')
				.append(decline_button).append(confirm_button)
				.appendTo(confirm_box);
			
			// center the alert box position
			confirm_box.css({'width': 900});
			confirm_box.css({
				'margin-left': -(confirm_box.outerWidth() / 2),
				'margin-top': -(confirm_box.outerHeight() / 2)
			});
					
			// animate the alert box
			confirm_overlay.css({opacity: 0}).animate({opacity:0.6}, 200);
			confirm_box.css({opacity: 0}).animate({opacity:1}, 200);
			
			confirm_button.click(function(){
				if(typeof(settings.success) == 'function'){ 
					settings.success();
				}
				confirm_overlay.fadeOut(200, function(){
					$(this).remove();
				});
				confirm_box.fadeOut(200, function(){
					$(this).remove();
				});
			});
			decline_button.click(function(){
				confirm_overlay.fadeOut(200, function(){
					$(this).remove();
				});
				confirm_box.fadeOut(200, function(){
					$(this).remove();
				});
			});
			
		} // gdlr_core_confirm_box

	var gdlr_core_demo_import = function(){

		this.form = $('#gdlr-core-demo-import-form');
		this.import_button = this.form.find('#gdlr-core-demo-import-submit');
		this.demo_selector = this.form.find('#gdlr-core-demo-import-option')
		this.preview_button = this.form.find('#gdlr-core-view-demo-button');
		this.success_report = this.form.find('#gdlr-core-demo-import-success');
		this.now_loading = '';

		this.init();
	}
	gdlr_core_demo_import.prototype = {

		init: function(){

			var t = this;

			// sync the demo download height
			t.sync_section_height();
			$(window).on('gdlr-core-tab-change', function(){ t.sync_section_height(); });

			// bind the preview button
			t.demo_selector.change(function(){
				var new_url = $(this).find(':selected').attr('data-url');
				t.preview_button.attr('href', new_url);
			});

			// submit button
			t.import_button.click(function(){

				// prevent multiple click
				if( $(this).hasClass('gdlr-core-active') ) return false;

				if( t.form.find('[data-name="image"]').is(':checked') ){
					gdlr_core_confirm_box_large({ text: window.jsImageLicenseContent, success: function(){ t.import_process(t); } });
				}else{
					gdlr_core_confirm_box({ success: function(){ t.import_process(t); } });
				}
				
			});

			// condition image click
			var image_condition = t.form.find('#gdlr-core-image-condition-wrap');
			t.form.find('#gdlr-core-image-condition').click(function(){
				image_condition.fadeIn(200);

				return false;
			})
			image_condition.find('.gdlr-core-condition-close').click(function(){
				image_condition.fadeOut(200);
			});
		},

		// for import process
		import_process: function( t ){

			t.import_button.addClass('gdlr-core-active');

			// obtain data
			var data_sent = { action: 'gdlr_core_demo_import', security: gdlr_core_ajax_message.nonce };
			
			t.form.find('[data-name]').each(function(){
				if( $(this).is('select') ){
					data_sent[$(this).attr('data-name')] = $(this).val();
				}else if( $(this).is('input[type="checkbox"]:checked') ){
					data_sent[$(this).attr('data-name')] = 1;
				}
			});

			$.ajax({
				type: 'POST',
				url: gdlr_core_ajax_message.ajaxurl,
				data: data_sent,
				dataType: 'json',
				beforeSend: function(jqXHR, settings){

					t.success_report.slideUp(200);

					t.init_now_loading();
					$('body').append(t.now_loading);
					t.now_loading.fadeIn();

				},
				error: function(jqXHR, textStatus, errorThrown){

					t.import_button.removeClass('gdlr-core-active');
					t.now_loading.fadeOut(200, function(){ $(this).remove() });

					setTimeout(function(){
						gdlr_core_alert_box({ status: 'failed', head: gdlr_core_ajax_message.error_head, message: gdlr_core_ajax_message.error_message });
					}, 400);
					

					// for displaying the debug text
					console.log(jqXHR, textStatus, errorThrown);
				},
				success: function(data){
					
					if( data.status == 'process' ){

						if( data.head ){
							t.set_now_loading(data.head + ' (0%)');
						}

						t.bulk_image_import({
							data_sent: data_sent,
							process: data.process,
							success_message: data.message,
							loading_head: data.head
						});

					}else{

						t.import_button.removeClass('gdlr-core-active');
						t.now_loading.fadeOut(200, function(){ $(this).remove() });

						if( data.status == 'success' ){
							if( data.message ){
								t.success_report.html(data.message).slideDown(200);
							}
						}else if( data.status == 'failed' ){
							setTimeout(function(){
								gdlr_core_alert_box({ status: 'failed', head: data.head, message: data.message });
							}, 400);
						}
					}

					if( data.console ){
						console.log(data.console);
					}
				}
			});

		}, // import_process

		// for bulk image import after processing the posts
		bulk_image_import: function( options ){

			var t = this;

			var data_sent = options.data_sent;
			data_sent.action = 'gdlr_core_demo_images_import';
			data_sent.process = options.process;

			var request_sent = 0;
			var request_count = 0;
			var success_count = 0;
			var import_interval = setInterval(function(){ 

				while( request_sent < 20 && request_count < options.process ){

					data_sent.current_process = request_count;

					$.ajax({
						type: 'POST',
						url: gdlr_core_ajax_message.ajaxurl,
						data: data_sent,
						dataType: 'json',
						error: function(jqXHR, textStatus, errorThrown){

							success_count++;
							request_sent--;
							if( success_count == options.process ){
								t.import_button.removeClass('gdlr-core-active');
								t.now_loading.fadeOut(200, function(){ $(this).remove() });
								t.success_report.html(options.success_message).slideDown(200);
							}else{
								t.set_now_loading(options.loading_head + ' (' + parseInt((success_count*100)/options.process) +'%)');
							}

							// for displaying the debug text
							console.log(jqXHR, textStatus, errorThrown);
						},
						success: function(data){

							success_count++;
							request_sent--;
							if( success_count == options.process ){
								t.import_button.removeClass('gdlr-core-active');
								t.now_loading.fadeOut(200, function(){ $(this).remove() });
								t.success_report.html(options.success_message).slideDown(200);
							}else{
								t.set_now_loading(options.loading_head + ' (' + parseInt((success_count*100)/options.process) +'%)');
							}

							if( data.console ){
								console.log(data.console);
							}
						}
					});

					console.log("request : " + request_count);
					request_sent++;
					request_count++;
				}

				if( request_count >= options.process ){
					clearInterval(import_interval);
				}
				
			}, 1000);

		}, // bulk_image_import

		// now loading box
		init_now_loading: function(){
			this.now_loading = $('<div class="gdlr-core-import-now-loading">\
					<div class="gdlr-core-import-now-loading-image" ></div>\
					<div class="gdlr-core-import-now-loading-head" ></div>\
					<div class="gdlr-core-import-now-loading-content" ></div>\
				</div>');
			this.set_now_loading(gdlr_core_ajax_message.importing_head, gdlr_core_ajax_message.importing_content);
		},
		set_now_loading: function(title, content){
			if( title ){
				this.now_loading.find('.gdlr-core-import-now-loading-head').html(title);
			}
			if( content ){
				this.now_loading.find('.gdlr-core-import-now-loading-content').html(content);
			}
		},

		// sync section height
		sync_section_height: function(){

			var max_height = 0;
			this.form.children('.gdlr-core-demo-import-section-wrap').css('height', 'auto').each(function(){
				if($(this).height() > max_height){
					max_height = $(this).height();
				}
			});
			this.form.children('.gdlr-core-demo-import-section-wrap').height(max_height);

		},


	}; // gdlr_core_demo_import.prototype

	$(document).ready(function(){

		// bind tabs
		$('#gdlr-core-getting-start-nav').each(function(){

			var nav_bar = $(this);
			var nav_content  = $(this).siblings('#gdlr-core-getting-start-content');

			nav_bar.children('a').click(function(){
				if( $(this).hasClass('gdlr-core-active') ){ return false; }

				if( $(this).attr('data-page') ){
					$(this).addClass('gdlr-core-active').siblings().removeClass('gdlr-core-active');

					var active_content = nav_content.children('[data-page="' + $(this).attr('data-page') + '"]');
					active_content.addClass('gdlr-core-active').css('display', 'none').fadeIn(200)
						.siblings().removeClass('gdlr-core-active').hide();

					$(window).trigger('gdlr-core-tab-change');

					return false;
				}
			});

		});

		// demo import
		new gdlr_core_demo_import();

	});

})(jQuery);