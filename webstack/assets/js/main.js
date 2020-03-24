	// $(document).ready(function() {
	//     $("#main-menu li ul li").click(function() {
	//         $(this).siblings('li').removeClass('active'); // 删除其他兄弟元素的样式
	//         $(this).addClass('active'); // 添加当前元素的样式
	//     });
	//     $("a.smooth").click(function() {
	//         $("html, body").animate({
	//             scrollTop: $($(this).attr("href")).offset().top - 30
	//         }, {
	//             duration: 500,
	//             easing: "swing"
	//         });
	//     });
	//        return false;
	// });

	$(document).ready(function () {
		$.getJSON('./assets/data.json', function (data) {
			if (data && data.length) {
				return;
			}
			createEle(data);
		});
	})



	function createEle(data) {
		let element = document.getElementById('main-content');
		let fragment = document.createDocumentFragment();

		for (const [key, value] of Object.entries(data)) {
			let h4 = document.createElement('h4');
			h4.className = 'text-gray';
			let i = document.createElement('i');
			i.className = 'linecons-tag';
			i.style = 'margin-right: 7px;';
			i.id = key;
			h4.appendChild(i)
			h4.appendChild(document.createTextNode(key));
			fragment.appendChild(h4);

			let div = document.createElement('div');
			div.className = "row";
			div.id = "content"
			for (const [c_key, c_value] of Object.entries(value)) {
				let c_div = document.createElement('div');
				c_div.className = 'col-sm-3';
				c_div.innerHTML = `
							<div class="xe-widget xe-conversations box2 label-info"
								onclick="window.open('${c_value.url}', '_blank')" data-toggle="tooltip" data-placement="bottom"
								title="${c_value.url}" data-original-title="${c_value.url}">
								<div class="xe-comment-entry">
									<a class="xe-user-img">
										<img src="https://cdn.jsdelivr.net/gh/w3ctim/picBed/webstack/assets/images/logo/${c_value.img}" class="img-circle" width="40">
									</a>
										<div class="xe-comment">
											<a href="#" class="xe-user-name overflowClip_1">
												<strong>${c_value.name}</strong>
											</a>
											${c_value.kw ? `<p class="overflowKeyword">${c_value.kw}</p>` : ''}
											<p class="overflowClip_2">${c_value.disc}</p>
										</div>
									</div>
								</div>
							`
				div.appendChild(c_div);
			}
			fragment.appendChild(div);
		}
		element.appendChild(fragment);

		$("[data-toggle='tooltip']").tooltip();
	}

	var href = "";
	var pos = 0;
	$("a.smooth").click(function (e) {
		$("#main-menu li").each(function () {
			$(this).removeClass("active");
		});
		$(this).parent("li").addClass("active");
		e.preventDefault();
		href = $(this).attr("href");
		pos = $(href).position().top - 30;
		$("html,body").animate({
			scrollTop: pos
		}, 500);
	});