// JavaScript Document
var Car = function () {
	//-----------------------------------------
	this.image_dir = "https://cdn.jsdelivr.net/gh/w3ctim/picBed/webstack/assets/car/img/";
	this.image_image = this.image_dir + "lotus_image.png"; //IE用
	this.image_blank = this.image_dir + "lotus_blank.gif";
	this.image_sprite = this.image_dir + "lotus_sprite.png";
	//-----------------------------------------
	this.$body; //車の実体
	this.$container //車のコンテナ
	this.$target; //目標地点の実体
	this.$text;
	this.degree = 0; //車の角度
	this.position; //現在の座標
	this.target; //移動の目標地点の座標
	this.defaultSpeed = 12; //速度の初期値
	this.speed = this.defaultSpeed; //速度
	this.targetSpeed = 8; //指定速度
	this.size = 240; //車のサイズ
	this.steering = 4; //最大操舵力
	this.isDriving = true; //走行中フラグ
	this.isIE = false; //$.browser.msie ? true : false;
	this.timerId;
	this.mouse = new Point(0, 0);
	this.constructor.apply(this);
}

Car.prototype = {
	/*=======================================
	 *コンストラクタ
	 */
	constructor: function () {

		//console.log("IE? : " + this.isIE );

		//車のコンテナ
		this.$container = $("<p>")
			.css({
				"position": "absolute",
				"left": "0",
				"top": "0",
				"z-index": 99
			});

		//車の実体(IEは別処理)
		var src = this.isIE ? this.image_image : this.image_blank;
		var bg = this.isIE ? this.image_blank : this.image_sprite;
		var initX = (Math.random() * $("html").width());
		var initY = (this.size * -2);
		this.$body = $("<img>").attr({
				"id": "steering_car",
				"src": src
			})
			.css({
				"position": "absolute",
				"width": this.size + "px",
				"height": this.size + "px",
				"top": initY + "px",
				"left": initX + "px",
				"background-image": "url(" + bg + ")"
			});
		this.$container.append(this.$body);

		//目標地点の実体
		this.$target = $("<p>■</p>");
		this.$target.css({
			"position": "absolute",
			"font-size": "24px",
			"color": "#FF0000"
		});
		this.$text = $("<p>\u25cf</p>");
		this.$text.css({
			"padding": "5px",
			"position": "fixed",
			"background": "#fff",
			"font-size": "12px",
			"border": "solid"
		});

		//座標の初期化
		var self = this;
		this.position = new Point();
		this.position.x = initX;
		this.position.y = initY;
		this.timerId = setTimeout(function () {
			self.resume();
		}, 1000);
		this.randomTarget();
		//this.randomTarget();
	},
	/*=======================================
	 * 初期化
	 */
	initialize: function ($continer) {
		$continer
			.append(this.$container)
			//.append( this.$target )
			//.append( this.$text )
			.css({
				"overflow-x": "hidden"
			});

		//エンターフレームイベントの登録
		var self = this;
		var timeline = new Timeline({
			fps: 30
		});
		var delay = Math.random() * 10000;
		timeline.bind(timeline.EVENT_ENTER_FRAME, function () {
			self.update.apply(self);
		});
		setTimeout(function () {
			timeline.start();
		}, delay);

		//マウスイベントの登録
		$("html").mousemove(function (e) {

			if (self.isIE) {
				return false;
			}

			self.mouse.x = e.pageX;
			self.mouse.y = e.pageY;
			if (self.hitTest(self.mouse, 200, true)) {
				self.resume();
				self.targetSpeed = 32;
				self.avoidTarget(self.mouse);
			};
		});
	},
	/*=======================================
	 * 前進を停止
	 */
	pause: function () {
		if (!this.isDriving) {
			return;
		}
		var self = this;
		var time = 6000 + (Math.random() * 8000);
		this.targetSpeed = 0;
		this.isDriving = false;
		this.timerId = setTimeout(function () {
			self.resume();
		}, time);
	},
	/*=======================================
	 * 前進を再開
	 */
	resume: function () {
		if (this.isDriving) {
			return;
		}
		clearTimeout(this.timerId);
		this.targetSpeed = this.defaultSpeed;
		this.isDriving = true;
	},
	/*=======================================
	 *目標に向かって前進
	 */
	update: function () {
		//これを書かないとIEでエラーになる。
		this.$body = $("#steering_car");

		//現在位置から目標地点までの角度を計算
		var dx = this.target.x - this.position.x;
		var dy = this.target.y - this.position.y;
		var radian = Math.atan2(dy, dx);
		var degree = radian * 180 / Math.PI;

		//現在の角度と算出した角度を掛けて進行方向を決定
		var diff = degree - this.degree;
		diff = (diff < -180) ? diff + 360 : (diff > 180) ? diff - 360 : diff;
		if (this.isDriving) {
			var vector = diff * this.speed / 80;
			var vAbs = diff < 0 ? -1 : 1;
			vector = (Math.abs(vector) > this.steering) ? this.steering * vAbs : vector;
			this.degree += vector;
		}

		//進行方向に速度を掛けて加速度を算出
		radian = this.degree / 180 * Math.PI;
		var prevSpeed = this.speed;
		if (this.targetSpeed > this.speed) {
			this.speed += .25;
		} else {
			this.speed += (this.targetSpeed - this.speed) * .1;
		}

		var vx = Math.cos(radian) * this.speed;
		var vy = Math.sin(radian) * this.speed;

		//現在位置に加速度を加算
		this.position.x += vx;
		this.position.y += vy;

		//実体に反映(座標の設定、進行方向に合わせて車体の画像を差し替え)
		var slideValue = (Math.abs(vector) == this.steering) ? 2 : Math.abs(vector) > 1 ? 1 : 0;
		var spriteX = (2 + slideValue) * -this.size;
		var spriteY = this.speed < this.defaultSpeed && this.speed < prevSpeed && this.speed > 0.05 ? this.size : -this.size;

		this.$body
			.css({
				"left": this.position.x - (this.size * .5),
				"top": this.position.y - (this.size * .5),
				"background-position": spriteX + "px " + spriteY + "px"
			})
			.rotate(this.degree);

		//目標地点まで到達したら目標地点を更新(たまに停止)
		if (this.hitTest(this.target, 100)) {
			if (Math.random() * 3 < 1) {
				this.pause();
			} else {
				this.randomTarget();
			}

		}
	},
	/*=======================================
	 *指定された座標の反対方向に目標地点を変更
	 *@param target 回避対象の座標
	 */
	avoidTarget: function (target) {
		//現在位置から目標地点までの角度を計算
		var dx = this.position.x - target.x;
		var dy = this.position.y - target.y;
		var radian = Math.atan2(dy, dx);
		var point = new Point(
			Math.cos(radian) * 200 + target.x,
			Math.sin(radian) * 200 + target.y
		);
		this.setTarget(point);
	},

	/*=======================================
	 *目標地点をランダムに変更
	 */
	randomTarget: function () {
		var rand = Math.random();
		var tx;
		if (rand < .2) {
			tx = Number($("html").width()) * Math.random();
		} else if (rand < .6) {
			tx = Number($("html").width()) + (Math.random() * 300);
		} else {
			tx = Math.random() * -300;
		}
		//var tx = ( Math.random() < .5 ) ? Math.random() * 50 : $("html").width() - Math.random() * 50;
		// var ty = $("html").attr('clientHeight') * Math.random() + $(window).scrollTop();

		var ty = document.documentElement.clientHeight * Math.random() + $(window).scrollTop();

		if (this.isDriving) {
			this.targetSpeed = this.defaultSpeed + (Math.random() * 12) - 6;
		}
		this.setTarget(new Point(tx, ty));
	},
	/*=======================================
	 *目標地点の変更
	 *@param target 目標地点の座標
	 */
	setTarget: function (target) {
		this.target = target;
		this.$target.css({
			"left": this.target.x,
			"top": this.target.y
		});
	},
	/*=======================================
	 * $textに文字を出力
	 * @param value 出力したい文字列
	 */
	console: function (value) {
		this.$text.html(value);
	},
	/*=======================================
	 *$bodyとの衝突判定
	 *@param target:Point 判定対象の座標オブジェクト
	 *@param radius:Number 判定の距離
	 *@return Boolean
	 */
	hitTest: function (target, radius, dump) {
		var dx = target.x - this.position.x;
		var dy = target.y - this.position.y;
		var distance = Math.sqrt(dx * dx + dy * dy);
		if (dump) {
			var d = Math.round(distance / 10) * 10;
			this.console(
				"mouse.x : " + target.x + "<br>" +
				"mouse.y : " + target.y + "<br>" +
				"car.x : " + Math.round(this.position.x) + "<br>" +
				"car.y : " + Math.round(this.position.y) + "<br>" +
				"distance : " + d + "<br>"
			);
		}
		return distance < radius;
	}
}

/**/
var Point = function () {
	this.x;
	this.y;
	this.initialize.apply(this, arguments)
}
Point.prototype = {
	initialize: function (x, y) {
		x = (typeof x === "undefined") ? 0 : x;
		y = (typeof y === "undefined") ? 0 : y;
		this.x = x;
		this.y = y;
	}
}