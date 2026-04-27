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
	
	const $resume = document.querySelector("#continueVideo"),
		$resumeNow = document.querySelector("#resumeNow");
	
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
	
	const $pudding = document.querySelector("#pudding"),
		$puddingImg = document.querySelector("#puddingImg"),
		$puddingCheck2 = document.querySelector("#puddingCheck2");
	
	const $offers = document.querySelector("#offers");
	
	const $puddingDoneBtns = document.querySelectorAll("#pudding .puddingDone"),
		$puddingBackBtns = document.querySelectorAll("#pudding .puddingBack");
	
	const $puddingCart = document.querySelector("#cart"),
		$puddingCartBtn = document.querySelector("#toPuddingCart");
	
	const $millerWaitList = document.querySelector("#waitlist"),
		$waitlistBtn = document.querySelector("#toWaitlist");
	
	const $carlDex = document.querySelector("#carldex"),
		$carldexBtn = document.querySelector("#toCarldex");
	
	const $preorderBtn = document.querySelector("#toWaitlist2");
	
	// Init Skipper Pro Ultra Max Max Neo
	
	let currentSubscription = 0, // more subscriptions bought -> longer upsell titles and increased pricing
		currentPlanName = "Pro Ultra";
	
	let storage = getLocalStorage();
	
	if(storage) {
		const subs = storage.getItem("timesBoughtSkipperPro");
		
		if(typeof subs == "number" || (typeof subs == "string" && isFinite(subs))) {
			currentSubscription = parseInt(subs);
		}
		
		const plan = storage.getItem("currentSkipperProPlan");
		
		if(typeof plan == "string" && plan.length > "Pro Ultra".length) {
			currentPlanName = plan;
		}
	}
	
	const prices = [3.49, 6.99, 12.99, 19.99];
	
	const currentPrice = "$"+ (currentSubscription < prices.length ? prices[currentSubscription] : prices[prices.length - 1] * currentSubscription).toFixed(2),
		upsellPrice = "$"+ ((currentSubscription + 1) < prices.length ? prices[(currentSubscription + 1)] : prices[prices.length - 1] * (currentSubscription + 1)).toFixed(2);
	
	const planNameParts = ["Ultra", "Max Max", "Neo", "Pro+", "D1T", "Joel", "E&E"];
	
	let upsellPlanName = currentPlanName;
	
	if(currentPlanName == "Pro Ultra") { // hardcode the first upsell for memes
		upsellPlanName += " Max Joel";
	} else {
		for(let i = 0; i < (currentSubscription > 3 ? 4 : randomBetween(1, 3)); i++) {
			let nextName = planNameParts.random();
			
			if(currentSubscription < 4 && upsellPlanName.includes(nextName)) { // randomize again if the plan already has one of these to lessen chance of duplicate names (not to entirely block though)
				nextName = planNameParts.random();
			}
			
			upsellPlanName += " "+ nextName;
		}
	}
	
	document.querySelectorAll(".currentPlanName").forEach(($el) => {
		$el.textContent = currentPlanName;
	});
	document.querySelectorAll(".currentPrice").forEach(($el) => {
		$el.textContent = currentPrice;
	});
	
	document.querySelectorAll(".upsellPlanName").forEach(($el) => {
		$el.textContent = upsellPlanName;
	});
	document.querySelectorAll(".upsellPrice").forEach(($el) => {
		$el.textContent = upsellPrice;
	});
	
	if(currentSubscription > 0) {
		document.querySelector("#subscription").classList.replace("red", "orange");
		document.querySelector("#subscriptionIcon").src = "icons/upsell.svg";
		document.querySelector("#purchaseReason").textContent = "You're eligible for an upgrade!";
		document.querySelector("#purchaseVerb").textContent = "upgrade";
	}
	
	$container.classList.add("loaded", `subscription-${currentSubscription}`);
	
	
	// State switchers
	
	let selectedUpsell = false;
	
	let delayInterval = null,
		closeTimeout = null,
		currentTimeout = null;
	
	function play() {
		$container.classList.add("playing");
		$container.classList.remove("subscribing");
		
		clearInterval(delayInterval);
		
		$skip.classList.add("active");
		
		$skipTxt.textContent = "Skip Ad…";
	}
	
	function skip() {
		$container.classList.add("subscribing");
		$container.classList.remove("playing");
		
		clearInterval(delayInterval);
		clearTimeout(closeTimeout);
		
		clearCurrentStep("subscription");
		clearTimeout(currentTimeout);
		
		$features.classList.remove("left", "right");
		$features.classList.add("active");
	}
	
	function clearCurrentStep(container, dir) {
		if(!dir) {
			dir = "left";
		}
		
		const $current = document.querySelector("#"+ container +" .step.active");
		
		if($current) {
			$current.classList.replace("active", dir);
			
			currentTimeout = setTimeout(() => {
				$current.classList.remove(dir);
			}, 400);
		}
		
		const $cont = document.querySelector("#"+ container +" .content");
		
		if($cont) {
			$cont.scrollTo({
				top: 0,
				behavior: "smooth"
			});
		}
	}
	
	function subscribe() {
		clearInterval(delayInterval);
		clearTimeout(closeTimeout);
		
		clearCurrentStep("subscription");
		
		$details.classList.add("right");
		
		setTimeout(() => {
			$details.classList.replace("right", "active");
		}, 100);
	}
	
	function choosePlan(plan) {
		selectedUpsell = (plan === "upsell");
		
		if(plan === "upsell" || !currentSubscription) {
			terms();
		} else {
			resume();
		}
	}
	
	function terms() {
		clearCurrentStep("subscription");
		
		$terms.classList.add("right");
		
		setTimeout(() => {
			$terms.classList.replace("right", "active");
		}, 100);
	}
	
	function payment() {
		clearTimeout(closeTimeout);
		
		clearCurrentStep("subscription");
		
		$container.classList.add("paymentPending");
		
		$payment.classList.add("right");
		
		setTimeout(() => {
			$payment.classList.replace("right", "active");
		}, 100);
		
		// closeTimeout = setTimeout(done, 5000);
		closeTimeout = setTimeout(pudding, (!currentSubscription ? 5000 : 1000));
		
		if(selectedUpsell) {
			document.querySelector("#subscription").classList.replace("red", "green");
			document.querySelector("#subscription").classList.replace("orange", "green");
			document.querySelector("#subscriptionIcon").src = "icons/feature.svg";
			document.querySelector("#purchaseReason").textContent = "Enjoy your new subscription!";
			document.querySelector("#purchaseVerb").textContent = "upgrade";
			
			document.querySelectorAll(".currentPlanName").forEach(($el) => {
				$el.textContent = upsellPlanName;
			});
		} else {
			document.querySelector("#subscription").classList.replace("red", "orange");
			document.querySelector("#subscriptionIcon").src = "icons/upsell.svg";
			document.querySelector("#purchaseReason").textContent = "Your subscription is renewed!";
			document.querySelector("#purchaseVerb").textContent = "upgrade";
		}
	}
	
	function pudding() {
		$container.classList.add("specialOffer");
		
		$offers.classList.add("active");
		
		setTimeout(() => {
			$pudding.classList.add("canClose");
		}, 1000); // 5000
	}
	
	function done() {
		$container.classList.remove("specialOffer");
		
		clearTimeout(closeTimeout);
		
		closeTimeout = setTimeout(() => {
			clearCurrentStep("subscription");
			
			$done.classList.add("right");
			
			setTimeout(() => {
				$done.classList.replace("right", "active");
			}, 100);
			
			if(storage) {
				if(selectedUpsell || currentSubscription == 0) {
					storage.setItem("timesBoughtSkipperPro", ++currentSubscription);
				}
				
				if(selectedUpsell) {
					storage.setItem("currentSkipperProPlan", upsellPlanName);
				}
			}
		}, 2000);
	}
	
	function resume() {
		clearCurrentStep("subscription");
		
		$resuming.classList.add("right");
		
		let delay = 7;
		
		setTimeout(() => {
			$resuming.classList.replace("right", "active");
			
			delayInterval = setInterval(() => {
				delay -= 0.1;
				
				if(delay <= 0) {
					resumeNow();
				} else {
					$resumeDelay.textContent = delay.toFixed(1);
				}
			}, 100);
		}, 100);
	}
	
	function resumeNow() {
		$container.classList.add("restarting");
		
		play();
		
		communicate("play");
		
		clearTimeout(closeTimeout);
		
		closeTimeout = setTimeout(() => {
			document.location.href += "?restart=1"; // restarts the subscription overlay state
		}, 1000);
	}
	
	function actuallySkip() {
		$container.classList.add("playing", "skipped");
		$container.classList.remove("subscribing", "specialOffer");
		
		clearInterval(delayInterval);
		clearTimeout(closeTimeout);
		
		closeTimeout = setTimeout(() => {
			communicate("success");
		}, 1000);
	}
	
	function puddingCart() {
		const $options = document.querySelectorAll(`#pudding [class*="puddingCart"]`);
		
		if($options) {
			$options.forEach(($el) => {
				$el.classList.remove("active");
			});
		}
		
		const $qty = document.querySelector("#pudding1");
		
		if($qty) {
			const qty = parseInt($qty.value);
			
			let sel = "";
			
			if(qty >= 1 && qty <= 3) {
				sel = "puddingCartHas"+ qty;
			} else {
				sel = "puddingCartHasALot";
			}
			
			const $qtyEls = document.querySelectorAll("."+ sel);
			
			if($qtyEls) {
				$qtyEls.forEach(($el) => $el.classList.add("active"));
			}
		}
		
		const $warranty = document.querySelector("#puddingCheck1");
		
		let warrantySel = "puddingCartNoWarranty";
		
		if($warranty && $warranty.checked) {
			warrantySel = "puddingCartExtWarranty"
		}
		
		const $warrantyEls = document.querySelectorAll("."+ warrantySel);
		
		if($warrantyEls) {
			$warrantyEls.forEach(($el) => $el.classList.add("active"));
		}
		
		const $armor = document.querySelector("#puddingCheck2");
		
		let armorSel = "puddingCartNoArmor";
		
		if($armor && $armor.checked) {
			armorSel = "puddingCartHasArmor"
		}
		
		const $armorEls = document.querySelectorAll("."+ armorSel);
		
		if($armorEls) {
			$armorEls.forEach(($el) => $el.classList.add("active"));
		}
		
		const $delayed = document.querySelectorAll(`#pudding [class*="delayToShow"]`);
		
		if($delayed) {
			$delayed.forEach(($el) => {
				$el.classList.remove("shown");
				
				$el.addEventListener("transitionend", () => {
					$el.classList.add("shown");
				});
			});
		}
		
		clearCurrentStep("pudding");
		
		$puddingCart.classList.add("right");
		
		setTimeout(() => {
			$puddingCart.classList.replace("right", "active");
		}, 100);
	}
	
	function millerWaitList() {
		clearCurrentStep("pudding");
		
		$millerWaitList.classList.add("right");
		
		setTimeout(() => {
			$millerWaitList.classList.replace("right", "active");
		}, 100);
	}
	
	function carlDex() {
		clearCurrentStep("pudding");
		
		$carlDex.classList.add("right");
		
		setTimeout(() => {
			$carlDex.classList.replace("right", "active");
		}, 100);
	}
	
	function backToPudding() {
		clearCurrentStep("pudding", "right");
		
		$offers.classList.add("left");
		
		setTimeout(() => {
			$offers.classList.replace("left", "active");
		}, 100);
	}
	
	
	// Main event listeners
	
	$skip.addEventListener("click", () => {
		if(!$container.classList.contains("subscribing")) {
			if($skip.classList.contains("active")) {
				communicate("pause");
				
				skip();
			}
		} else {
			communicate("play");
			
			play();
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
			alert("Why don't you read the terms and conditions first? (Scroll all the way down.)");
		}
	});
	
	$paymentBtn.addEventListener("click", () => {
		if(!$check1.checked) {
			alert("Why don't you read the terms and conditions first? (Scroll all the way down.)");
		} else if(!$check2.checked) {
			alert("Why don't you agree to the terms and conditions first?");
		} else {
			payment();
		}
	});
	
	$puddingCartBtn.addEventListener("click", puddingCart);
	$waitlistBtn.addEventListener("click", millerWaitList);
	$carldexBtn.addEventListener("click", carlDex);
	
	$preorderBtn.addEventListener("click", () => {
		alert("An expected error occurred while processing your order!");
	});
	
	$puddingCheck2.addEventListener("change", () => {
		$puddingImg.src = ($puddingCheck2.checked ? "./puddings/puddingHawkArmor_chatgpt.jpg" : "./puddings/pudding.jpg");
	});
	
	$puddingDoneBtns.forEach(($el) => {
		$el.addEventListener("click", () => {
			if($container.classList.contains("subscribing")) {
				done();
			} else {
				actuallySkip();
			}
		});
	});
	
	$puddingBackBtns.forEach(($el) => {
		$el.addEventListener("click", backToPudding);
	});
	
	$resumeNow.addEventListener("click", resumeNow);
	
	$actuallySkip.addEventListener("click", (e) => {
		e.stopPropagation();
		e.preventDefault();
		
		actuallySkip();
		
		return false;
	});
	
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
	
	if(document.location.href.indexOf("restart=1") > -1) {
		$container.classList.add("restarting"); // hack to animate skip button "back" in after a restart
		$container.classList.add("started");
		
		play();
		
		clearTimeout(closeTimeout);
		
		closeTimeout = setTimeout(() => {
			$container.classList.remove("restarting");
		}, 200);
	}
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
