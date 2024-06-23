
class LoginBonus
{
	constructor()
	{
		this.data = null;
		this.callbacks = [];

		this.update().catch(e => console.error(e));
	}

	async update()
	{
		const url = './api/ex/p/poimal/updateLoginBonus';

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'X-HTTP-Method-Override': 'GET',
				'X-Auth-Token': 'ah47gzdebwd3:40ikgiqkdv40ogokcs08ock4',
				'Content-Type': 'application/json'
			},
		});

		this.data = await response.json();

		this.draw();

		this.callbacks.forEach(func => func(this.data));

		this.callbacks = [];
	}

	onUpdate(func)
	{
		if(this.data)
		{
			func(this.data);
		}
		else
		{
			this.callbacks.push(func);
		}
	}

	draw()
	{
		if(this.data.state != 1) return;
		if(this.data.days_logging_in > 28) return;

		const modal_html = `
		<div class="modal">
			<div class="modal__bg modalclose"></div>
				<div class="modal__window">
					<div class="modal__contents">
						<div class="modal__use">
							<div class="modal__use__title">毎日ログインキャンペーン！</div>
							<div class="modal__mainbg is-login${('00' + this.data.days_logging_in).slice(-2)}">
								<p>ログイン${this.data.days_logging_in}日目</p>
							</div>
						<div class="closeBtn modalclose"></div>
					</div>
				</div>
			</div>
		</div>
		`;
		$('header').append(modal_html);

		setTimeout(() =>
		{
			$('.modalclose').on('click', () => $('.modal').hide());
			$('.close').on('click', () => $('.modal').hide());

			$('.modal').addClass('is-show');

			const images_html = `
			<div class="camp__logo"><img src="./file/box/assets/img/camp_logo.png" alt=""></div>
			<div class="camp__login"><img src="./file/box/assets/img/camp_login1.png" alt=""></dvi>
			`;
			$('.modal__mainbg').append(images_html);

			setTimeout(() =>
			{
				let index = 1;
				const timer = setInterval(() =>
				{
					$('.camp__login img').attr('src', `./file/box/assets/img/camp_login${index}.png`);

					if(index > this.data.days_logging_in)
					{
						clearInterval(timer);

						if(this.data.bonus_points > 0)
						{
							COINS.draw(this.data.bonus_points);
						}
					}
					index++;
				}, 300);
			}, 2000);
		}, 500);
	}
}

class Coins
{
	draw(points)
	{
		$('body').append('<div class="parent3Dtransform"></div>');

		const big_coin_html = `
		<div class="camp__icon01"><img src="./file/box/assets/img/top_move04.svg" alt=""></div>
		<div class="camp__icon02"><img src="./file/box/assets/img/top_move04.svg" alt=""></div>
		<div class="camp__point"><img src="./file/box/assets/img/camp_icon_${points}p.svg" alt=""></div>
		`;
		$('.parent3Dtransform').append(big_coin_html);

		setTimeout(() =>
		{
			document.querySelector('.camp__point').addEventListener('click', event =>
			{
				party.confetti(event.currentTarget, {
					count: party.variation.range(50, 50),
				});
			});

			$('.camp__point').trigger('click');

			let coins_html = '';
			for(let i = 0; i < 31; i++)
			{
				coins_html += '<div class="coin"><span></span></div>';
			}
			$('.parent3Dtransform').append(coins_html);

			$('.parent3Dtransform').append('<div class="coin_meny01"></div>');
			$('.parent3Dtransform').append('<div class="coin_meny02"></div>');

			$(window).delay(4000).queue(() =>
			{
				$('.parent3Dtransform').addClass('mend');
				$('.parent3Dtransform').fadeOut(2000);
				$('.camp__logo').addClass('efeend');
			});
		}, 2000);
	}
}

const COINS = new Coins();
const LOGIN_BONUS = new LoginBonus();

function formatNumberWithCommas(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

document.addEventListener("DOMContentLoaded", async function() {
    // セッションストレージからdisplayNameを取得
    const displayName = sessionStorage.getItem('displayName');

    if (displayName) {
        // ユーザー名表示用の要素を作成
        const userDisplayElement = document.createElement('div');
        userDisplayElement.classList.add('p_header_login_name');

        const nameSpan = document.createElement('span');
        nameSpan.textContent = displayName;
        nameSpan.classList.add('bold-text');
        userDisplayElement.appendChild(nameSpan);

		// セッションストレージからポイントを取得
        const totalPoints = sessionStorage.getItem('point');

		if (totalPoints) {
			// ポイントを3桁区切りで表示（数値として扱い、先頭の0を削除）
			//const formattedPoints = totalPoints.toLocaleString(); 
			const formattedPoints = formatNumberWithCommas(totalPoints); 
			const pointsSpan = document.createElement('span');
			pointsSpan.textContent = ` (${formattedPoints}p)`;
			userDisplayElement.appendChild(pointsSpan);
		}

        //userDisplayElement.append('さん');
        document.querySelector('.p_header_login').prepend(userDisplayElement);

		// 240618 c3_yamada add
		// 既存の .header__mypage__login 内の <a> を置き換え
		const loginWrapper = document.querySelector('.header__mypage__login');
		if (loginWrapper) {
			const loginLink = loginWrapper.querySelector('a');
			if (loginLink) {
				const displayNameP = document.createElement('p');
				displayNameP.textContent = displayName;

				// loginLink 内の既存の <p> 要素を取得
				const loginP = loginLink.querySelector('p');
				if (loginP) {
					loginLink.replaceChild(displayNameP, loginP);
				} else {
					// <p> 要素がない場合には追加
					loginLink.appendChild(displayNameP);
				}

				// <a> 要素にクリックイベントを追加
				loginLink.addEventListener('click', logoutHandler);

			} else {
				loginWrapper.appendChild(userDisplayElement);
			}

			// loginWrapper にもクリックイベントを追加
			loginWrapper.addEventListener('click', logoutHandler);
		}

        // ログインリンクを非表示にする
        const loginLink = document.querySelector('.p_header_login_btn');
        if (loginLink) {
            loginLink.style.display = 'none';
        }

		// ログアウト処理|ユーザー名のdivタグにクリックイベントを追加
        // userDisplayElement.addEventListener('click', function() {

		// 	// displayName,uidをセッションストレージから削除
        //     sessionStorage.removeItem('displayName');
		// 	sessionStorage.removeItem('uid');
		// 	sessionStorage.removeItem('point');

		// 	alert("ログアウトします");

        //     window.location.href = '/index.html';  // ログアウトページへリダイレクト
        // });

		userDisplayElement.addEventListener('click', logoutHandler);
    }

	// ログアウト処理用のハンドラー
	function logoutHandler(event) {
		event.stopPropagation(); // イベントのバブリングを防止
		sessionStorage.removeItem('displayName');
		sessionStorage.removeItem('uid');
		sessionStorage.removeItem('userEmail');
		sessionStorage.removeItem('point');
		alert("ログアウトします");
		window.location.href = '/index.html';
	}
});

$(document).ready(function() {
	// AJAXリクエストでナビゲーションデータを取得
	$.ajax({
		url: 'navigation.php',
		method: 'GET',
		dataType: 'json',
		success: function(response) {
			// 取得したHTMLを解析し、ヘッダーとフッターに分けて挿入
			if (response.header && response.footer) {
				// ヘッダーのタイプ別とカテゴリ別
				if (response.header['タイプ別']) {
					$('#nav__pc a.subnavipa:contains("タイプ別")').after(response.header['タイプ別']);
					$('#nav__sp a.subnavipa:contains("タイプ別")').after(response.header['タイプ別']);
				}
				if (response.header['カテゴリ別']) {
					$('#nav__pc a.subnavipa:contains("カテゴリ別")').after(response.header['カテゴリ別']);
					$('#nav__sp a.subnavipa:contains("カテゴリ別")').after(response.header['カテゴリ別']);
				}

				// フッターのタイプ別とカテゴリ別
				if (response.footer['タイプ別']) {
					$('dt:contains("タイプ別で探す")').nextAll('dd').remove();
					$('dt:contains("タイプ別で探す")').after(response.footer['タイプ別']);
				}
				if (response.footer['カテゴリ別']) {
					$('dt:contains("カテゴリ別で探す")').nextAll('dd').remove();
					$('dt:contains("カテゴリ別で探す")').after(response.footer['カテゴリ別']);
				}
			}
		},
		error: function(xhr, status, error) {
			console.error('ナビゲーションの取得に失敗しました。');
			console.error('Status:', status);
			console.error('Error:', error);
			console.error('Response:', xhr.responseText);
		}
	});
});