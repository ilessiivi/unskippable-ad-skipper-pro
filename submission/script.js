function communicate(state) {
	window.top.postMessage({
		type: state
	}, "*");
}

document.addEventListener("DOMContentLoaded", () => {
	
	
	// Get UI elements for later
	
	const $container = document.querySelector("#overlay-container");
	
	const $features = document.querySelector("#features"),
		$resuming = document.querySelector("#resuming"),
		$resumeDelay = document.querySelector("#resumeDelay");
	
	const $skip = document.querySelector("#skip"),
		$skipTxt = document.querySelector("#skip-txt"),
		$skipSub = document.querySelector("#skip-sub");
	
	const $subscribe = document.querySelector("#subscribe"),
		$subscribe2 = document.querySelector("#subscribe2");
	
	const $resume = document.querySelector("#continueVideo");
	
	const $details = document.querySelector("#details");
	
	const $chooseCurrentBtn = document.querySelector("#chooseCurrent"),
		$chooseUpsellBtn = document.querySelector("#chooseUpsell");
	
	const $terms = document.querySelector("#terms"),
		$check1 = document.querySelector("#termsCheck1"),
		$check2 = document.querySelector("#termsCheck2"),
		$check2Label = document.querySelector("#termsCheck2Label");
	
	const $payment = document.querySelector("#payment"),
		$paymentBtn = document.querySelector("#paymentButton");
	
	const $done = document.querySelector("#done");
	
	const $actuallySkip = document.querySelector("#actuallySkip");
	
	
	// Init Skipper Pro Ultra Max Max Neo
	
	let currentSubscription = 0; // more subscriptions bought -> longer upsell titles and increased pricing
	
	let storage = getLocalStorage();
	
	if(storage) {
		const subs = storage.getItem("timesBoughtSkipperPro");
		
		if(typeof subs == "number" || (typeof subs == "string" && isFinite(subs))) {
			currentSubscription = parseInt(subs);
		}
	}
	
	$container.classList.add("loaded", `subscription-${currentSubscription}`);
	
	
	// State switchers
	
	let delayInterval = null,
		closeTimeout = null;
	
	function play(allowSkip) {
		$container.classList.add("playing");
		$container.classList.remove("subscribing");
		
		clearInterval(delayInterval);
		
		if(allowSkip || !currentSubscription) { // if not currently subscribed, allow "skip" to subscription purchase instantly
			$skip.classList.add("active");
			
			$skipTxt.textContent = "Skip Ad…";
		} else {
			$skip.classList.remove("active");
			
			$skipSub.textContent = [
				"Just wait a moment!",
				"Powered by Skipper Pro"
			].random();
			
			let delay = randomBetween(2, 6);
			
			$skipTxt.textContent = `Skip in ${delay.toFixed(1)}…`;
			
			delayInterval = setInterval(() => {
				delay -= 0.1;
				
				if(delay <= 0) {
					play(true);
				} else {
					$skipTxt.textContent = `Skip in ${delay.toFixed(1)}…`;
				}
			}, 100);
		}
	}
	
	function skip() {
		$container.classList.add("subscribing");
		$container.classList.remove("playing");
		
		clearInterval(delayInterval);
	}
	
	function clearCurrentStep() {
		const $current = document.querySelector("#overlay-container .step.active");
		
		if($current) {
			$current.classList.replace("active", "left");
			
			setTimeout(() => {
				$current.classList.remove("left");
			}, 400);
		}
	}
	
	function subscribe() {
		clearInterval(delayInterval);
		clearTimeout(closeTimeout);
		
		clearCurrentStep();
		
		$details.classList.add("right");
		
		setTimeout(() => {
			$details.classList.replace("right", "active");
		}, 100);
	}
	
	function choosePlan(plan) {
		clearCurrentStep();
		
		$terms.classList.add("right");
		
		setTimeout(() => {
			$terms.classList.replace("right", "active");
		}, 100);
	}
	
	function payment() {
		clearTimeout(closeTimeout);
		
		clearCurrentStep();
		
		$payment.classList.add("right");
		
		setTimeout(() => {
			$payment.classList.replace("right", "active");
		}, 100);
		
		closeTimeout = setTimeout(done, 3000);
	}
	
	function done() {
		clearCurrentStep();
		
		$done.classList.add("right");
		
		setTimeout(() => {
			$done.classList.replace("right", "active");
		}, 100);
	}
	
	function resume() {
		clearCurrentStep();
		
		$resuming.classList.add("right");
		
		let delay = 7;
		
		setTimeout(() => {
			$resuming.classList.replace("right", "active");
			
			delayInterval = setInterval(() => {
				delay -= 0.1;
				
				if(delay <= 0) {
					play();
					
					closeTimeout = setTimeout(() => {
						document.querySelectorAll("#overlay-container .step.active").forEach(($el) => {
							$el.classList.remove("active");
						});
						
						$features.classList.remove("left", "right");
						$features.classList.add("active");
					}, 1000);
				} else {
					$resumeDelay.textContent = delay.toFixed(1);
				}
			}, 100);
		}, 100);
	}
	
	function actuallySkip() {
		$container.classList.add("playing", "skipped");
		$container.classList.remove("subscribing");
		
		clearInterval(delayInterval);
		clearTimeout(closeTimeout);
		
		closeTimeout = setTimeout(() => {
			communicate("success");
		}, 1000);
	}
	
	
	// Main event listeners
	
	setTimeout(() => {
		skip();
	}, 200);
	
	$skip.addEventListener("click", () => {
		if(!$container.classList.contains("subscribing")) {
			if($skip.classList.contains("active")) {
				communicate("pause");
				
				skip();
			}
		} else {
			communicate("play");
			
			play(true);
		}
	});
	
	$resume.addEventListener("click", resume);
	
	$subscribe.addEventListener("click", subscribe);
	$subscribe2.addEventListener("click", subscribe);
	
	$chooseCurrentBtn.addEventListener("click", () => choosePlan("current"));
	$chooseUpsellBtn.addEventListener("click", () => choosePlan("upsell"));
	
	$check1.addEventListener("change", () => {
		$check2.disabled = !$check1.checked;
	});
	
	$check2Label.addEventListener("click", () => {
		if(!$check1.checked) {
			alert("Why don't read the terms and conditions first? (Scroll all the way down.)");
		}
	});
	
	$paymentBtn.addEventListener("click", () => {
		if(!$check1.checked) {
			alert("Why don't read the terms and conditions first? (Scroll all the way down.)");
		} else if(!$check2.checked) {
			alert("Why don't you agree to the terms and conditions first?");
		} else {
			payment();
		}
	});
	
	$actuallySkip.addEventListener("click", actuallySkip);
	
	window.addEventListener("message", (event) => {
		if(event.data && event.data.type) {
			switch(event.data.type) {
			case "adStarted":
				$container.classList.add("started");
				
				play();
				
				break;
				
			case "adFinished":
				$container.classList.add("finished");
				
				communicate("fail");
				
				break;
			}
		}
	});
});

function randomBetween(min, max) {
	return Math.floor(Math.random() * (max + 1 - min) + min);
}

Array.prototype.random = function() {
	return this[randomBetween(0, (this.length - 1))];
}

function getLocalStorage() {
	let storage;
	
	try {
		storage = window["localStorage"];
		
		const x = "__storage_test__";
		storage.setItem(x, x);
		storage.removeItem(x);
		
		return storage;
	} catch(err) {
		return (
			err instanceof DOMException &&
			err.name === "QuotaExceededError" &&
			// acknowledge QuotaExceededError only if there"s something already stored
			storage && storage.length !== 0
		);
	}
}
