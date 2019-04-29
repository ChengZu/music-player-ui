var Player = function() {
	this.paused = true;
	this.duration = 0;
	this.currentTime = 0;
	this.volume = 100;
	this.muteVolume = 100;
	this.progressClicked = false;
	this.volumeClicked = false;
	this.setOnPaused = false;
	this.onPlay = function() {};
	this.onPause = function() {};
	this.onerr = function() {};
	this.onVolume = function() {};
	this.dom = null;
}
Player.prototype = {
	$: function(name, dom) {
		if (dom == undefined) dom = this.dom;
		if (dom.id == name || dom.className == name) return dom;
		for (var i = 0; i < dom.childNodes.length; i++) {
			if (dom.childNodes.item(i).id == name || dom.childNodes.item(i).className == name) return dom.childNodes.item(i);
			if (dom.childNodes.item(i).childNodes.length > 0) {
				var find = this.$(name, dom.childNodes.item(i));
				if (find) return find;
			}
		}
		return false;
	},

	$$: function(name) {
		return document.querySelector(name);
	},

	init: function(name, time) {
		var html = '<div class="player_control"><div class="player_pop_layer"></div><div class="player_pop_content"><div id="player_play_ctr"><div class="player_pause"id="player_playback_pause"></div></div><div id="player_timer">0:00/0:00</div><div id="player_volume_ctr"><div id="player_volume"><div id="player_slider"><div id="player_volume_loaded"><div id="player_volume_pace"></div></div></div></div><div id="player_volume_icon"><div class="player_speaker_iocn"><div class="player_speaker_iocn_1"></div><div class="player_speaker_iocn_2"></div><div class="player_speaker_iocn_3"></div><div class="player_speaker_iocn_4"></div><div class="player_speaker_iocn_disabled"id="player_speaker_iocn_disabled"></div></div></div></div><div id="player_progress"><div id="player_slider"><div id="player_progress_loaded"><div id="player_progress_pace"></div></div></div></div></div></div>';
		this.dom = this.$$(name);
		this.dom.innerHTML = html;
		if(time != undefined){
			this.duration = time;
			this.enabled();
		}

		var _that = this;
		this.$('player_play_ctr').addEventListener("click",
		function(e) {
			if (_that.paused) _that.play();
			else _that.pause();
		},
		true);

		this.$('player_volume_icon').addEventListener("click",
		function(e) {
			if (_that.volume > 0) {
				_that.muteVolume = _that.volume;
				_that.volume = 0;
				_that.onVolume(_that);
			} else {
				_that.volume = _that.muteVolume;
			}
			_that.onVolume(_that);
			_that.updateVolumeUI();
		},
		true);

		this.initProgressSlider();
		this.initVolumeSlider();

		document.addEventListener("mousemove",
		function(e) {
			if (_that.progressClicked) _that.setProgress(e);
			if (_that.volumeClicked) _that.setVolume(e);

		},
		true);

		document.addEventListener("mouseup",
		function(e) {
			if (_that.progressClicked) _that.setProgress(e);
			if (_that.volumeClicked) _that.setVolume(e);
			_that.progressClicked = false;
			_that.volumeClicked = false;
			//_that.play();
		},
		true);

		this.updatePlayerUI();

	},

	reset: function() {
		this.paused = true;
		this.duration = 0;
		this.currentTime = 0;
		this.volume = 100;
		this.muteVolume = 100;
		this.progressClicked = false;
		this.volumeClicked = false;
		this.updatePlayerUI();
	},
	
	disabled: function() {
		this.$('player_pop_layer').style.display = 'block';
	},
	
	enabled: function() {
		this.$('player_pop_layer').style.display = 'none';
	},
	
	setDuration: function(time) {
		this.reset();
		this.duration = time;
		this.enabled();
		this.updatePlayerUI();
	},

	setCurrentTime: function(time) {
		if(time < 0 || time > this.duration) {
			this.currentTime = 0;
			this.pause();
		}else{
			this.currentTime = time;
			this.updatePlayerUI();
		}
	},

	play: function() {
		if (this.paused) {
			this.paused = false;
			this.onPlay(this);
			this.updatePlayButton();
		}
	},

	pause: function() {
		if (!this.paused) {
			this.paused = true;
			this.onPause(this);
			this.updatePlayButton();
		}
	},

	getLeft: function(e) {
		var offset = e.offsetLeft;
		if (e.offsetParent != null) offset += this.getLeft(e.offsetParent);
		return offset;
	},

	getwidth: function(e) {
		return e.clientWidth || e.offsetWidth;
	},

	initProgressSlider: function() {
		var _that = this;
		var slider = this.$("player_progress");
		slider.addEventListener("mousemove",
		function(e) {
			if (_that.progressClicked) _that.setProgress(e);

		},
		true);
		slider.addEventListener("mousedown",
		function(e) {
			_that.progressClicked = true;
			if (!_that.paused) _that.setOnPaused = true;
			_that.setProgress(e);
			_that.pause();

		},
		true);
		slider.addEventListener("mouseup",
		function(e) {
			_that.progressClicked = false;
			if (_that.setOnPaused) _that.play();
			_that.setProgress(e);
			_that.setOnPaused = false;

		},
		true);
	},

	initVolumeSlider: function() {
		var _that = this;
		var slider = this.$("player_volume");
		slider.addEventListener("mousemove",
		function(e) {
			if (_that.volumeClicked) _that.setVolume(e);
		},
		true);
		slider.addEventListener("mousedown",
		function(e) {
			_that.volumeClicked = true;
			_that.setVolume(e);

		},
		true);
		slider.addEventListener("mouseup",
		function(e) {
			_that.volumeClicked = false;
			_that.setVolume(e);
			_that.onVolume(_that);
		},
		true);
	},

	setProgress: function(e) {
		this.currentTime = Math.round(this.duration * this.getSlider("player_progress", e));
		this.updatePlayerUI();
	},

	setVolume: function(e) {
		this.volume = Math.round(100 * this.getSlider("player_volume", e));
		this.updatePlayerUI();
	},

	getSlider: function(name, e) {
		var slider = this.$(name);
		var width = this.getwidth(this.$(name));
		var offsetX = e.clientX - this.getLeft(slider);
		if (offsetX < 0) offsetX = 0;
		if (offsetX > width) offsetX = width;
		var percent = offsetX / width;
		return percent;
	},

	updatePlayerUI: function() {
		this.updatePlayButton();
		this.updateTimerUI();
		this.updateProgressUI();
		this.updateVolumeUI();
	},

	updatePlayButton: function() {
		if (this.paused) this.$('player_playback_pause').className = "player_pause";
		else this.$('player_playback_pause').className = "player_playback";
	},

	updateTimerUI: function() {
		this.$("player_timer").innerHTML = this.formatTime(Math.round(this.currentTime)) + " / " + this.formatTime(Math.round(this.duration));
	},

	updateProgressUI: function() {
		this.$("player_progress_loaded").style.width = Math.round((this.currentTime / this.duration) * 100) + "%";
	},

	updateVolumeUI: function() {
		this.$("player_volume_loaded").style.width = this.volume + "%";
		if (this.volume == 0) this.$('player_speaker_iocn_disabled').style.display = 'block';
		else this.$('player_speaker_iocn_disabled').style.display = 'none';
	},

	formatTime: function(sec) {
		var s = sec % 60;
		if (s < 10) s = "0" + s;
		var h = Math.floor(sec / 3600);
		var m = Math.floor((sec - h * 3600) / 60);
		var hstr = "";
		if (h > 0) hstr = h + ":";
		var str = hstr + m + ":" + s
		return str;
	}

}