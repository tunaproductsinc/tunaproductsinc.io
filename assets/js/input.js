
$(() =>
{
	if(profile_completeness >= 100) return;

	const html = `
	<div class="modal">
		<div class="modal__bg modalclose"></div>
		<div class="modal__window">
			<div class="modal__contents">
				<div class="modal__use">
					<div class="modal__use__alert">
						<div class="modal__use__alert__title">プロフィール完成してませんよ！</div>
						<div class="modal__use__alert__text">
							プロフィールを完成し、ポイントをゲットしましょう！
							<p class="modal__use__alert__point"><img src="./file/box/assets/img/ico_point02.svg" alt=""></p>
						</div>
					</div>
					<div class="closeBtn modalclose"></div>
				</div>
			</div>
		</div>
	</div>`;

	$('body').append(html);

	$('.modal').addClass('is-show');

	$('.modalclose').on('click', () => $('.modal, .parent3Dtransform').fadeOut());
	$('.close').on('click', () => $('.modal, .parent3Dtransform').fadeOut());
});
