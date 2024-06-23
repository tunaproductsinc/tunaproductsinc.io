<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $to = "XXXXXXXXXX@gmail.com";
    $subject = "お問い合わせ";
    $message = "氏名: " . $_POST['fh3qj1642esb'] . "\n";
    $message .= "メールアドレス: " . $_POST['fh3qj1mxr1pr'] . "\n";
    $message .= "電話番号: " . $_POST['fh3qj2erh9be'] . "\n";
    $message .= "お問い合わせ概要: " . implode(", ", $_POST['fh3qj44kntrf']) . "\n";
    $message .= "お問い合わせ内容: " . $_POST['fh3qj4kvx7j5'];

    // メールを送信
    mail($to, $subject, $message);

    // 送信後にリダイレクト
    header("Location: 送信完了ページのURL");
    exit;
}
?>
