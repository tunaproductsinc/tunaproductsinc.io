import { firestore } from "./firebase.js";

// グローバル変数
let lastVisible = null;
let firstVisible = null;
const pageSize = 10;
let totalProjects = 0;
let currentPage = 1;
let typeParam = null;
let categoryParam = null;
let sortParam = 'regist_unix';
let keywordParam = null;
let filteredProjects = [];
let allProjectsFetched = false;

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    typeParam = urlParams.get('type');
    categoryParam = urlParams.get('category');
    keywordParam = urlParams.get('keyword');

    console.log('Type Param:', typeParam);
    console.log('Category Param:', categoryParam);
    console.log('Keyword Param:', keywordParam);

    if (typeParam || categoryParam || keywordParam) {
        loadInitialPage();
    } else {
        // loadQuickInitialPage();
        loadInitialPage();
    }
};

// 高速に初期ページを読み込む
async function loadQuickInitialPage() {
    let query = firestore.collection("projectManagement")
        .orderBy(sortParam)
        .limit(pageSize);

    try {
        const snapshot = await query.get();
        filteredProjects = snapshot.docs.map(doc => doc.data());
        lastVisible = snapshot.docs[snapshot.docs.length - 1];
        totalProjects = await countProjectsAll();

        displayData(filteredProjects);
    } catch (error) {
        console.error('Error loading quick initial page:', error);
    }
}

// ソート条件を適用する関数（クライアント側でのソート）
function applyClientSideSorting(projects) {
    console.log('Sorting projects with:', sortParam);
    switch (sortParam) {
        case 'points_desc':
            return projects.sort((a, b) => b.point - a.point);
        case 'points_asc':
            return projects.sort((a, b) => a.point - b.point);
        case 'point_rate_desc':
            return projects.sort((a, b) => b.point_rate - a.point_rate);
        case 'point_rate_asc':
            return projects.sort((a, b) => a.point_rate - b.point_rate);
        default:
            return projects.sort((a, b) => b.regist_unix - a.regist_unix); // デフォルトのソート条件
    }
}

function displayData(projects) {
    console.log('Displaying projects:', projects);
    const dataList = document.querySelector('.list__block');
    dataList.innerHTML = ''; // 現在の内容をクリア

    // 現在のページの表示範囲を計算
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalProjects);

    projects.forEach((data, index) => {
        console.log('Project Data:', data);

        const session_id = "5YMvFrL1ZisavmLla8iZgBjbVx0"; // セッションIDに任意の値
        const uid = sessionStorage.getItem('uid'); // セッションストレージから uid を取得
        const kbp1 = uid ? `${uid}_${data.data_id}` : ''; // kbp1にエンドユーザーのuidと案件の識別子を渡す

        const urlWithUid = uid ? `${data.url}&pbid=${session_id}&kbp1=${kbp1}` : data.url;

        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <a href="${urlWithUid}" class="modalTrigger">
                <div class="top__block__image">
                    <img src="${data.image}" alt="${data.name}">
                </div>
                <div class="newList__info">
                    <p class="top__block__text--title">${data.name}</p>
                    <p class="top__block__text--s">${data.how_to_get}</p>
                    <p class="top__block__point--s"><span>${data.point}</span>P</p>
                </div>
            </a>
        `;
        dataList.appendChild(listItem);

        // モーダルトリガーの設定
        listItem.querySelector('.modalTrigger').addEventListener('click', function(e) {
            e.preventDefault(); // リンクのデフォルト動作を防ぐ
            if (!uid) {
                alert('未ログイン状態です。ログイン画面に遷移します。');
                window.location.href = '/login.html';
            } else {
                document.getElementById('modalBody').innerHTML = `
                    <div class="case_conditions1">
                        <div class="case_conditions1_body">${data.conditions1}</div>
                        <a href="${urlWithUid}" class="case_conditions1_link">外部サイトに進む</a>
                    </div>
                `;
                document.getElementById('caseModal').style.display = 'block';

                document.querySelector('.case_conditions1_link').addEventListener('click', function() {
                    const formData = new FormData();
                    formData.append('uid', uid);
                    formData.append('name', data.name);
                    formData.append('how_to_get', data.how_to_get);
                    formData.append('point', data.point);

                    fetch('../../send_mail.php', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.success) {
                            //alert("");
                        } else {
                            throw new Error(data.message);
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                });
            }
        });
    });

    // モーダルを閉じるイベント
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('caseModal').style.display = 'none';
    });

    // ボタンの表示制御
    document.querySelector('#prevPageButton').style.display = currentPage > 1 ? 'inline-block' : 'none';
    document.querySelector('#nextPageButton').style.display = end < totalProjects ? 'inline-block' : 'none';

    // 件数表示
    const caseBottomCountElement = document.querySelector('.case_bottom_count');
    if (caseBottomCountElement) {
        caseBottomCountElement.innerHTML = `${start}〜${end}件(${totalProjects}件中)`;
    }
}

async function countProjects() {
    let query = firestore.collection("projectManagement");

    if (typeParam) {
        query = query.where('how_to_get', '==', typeParam);
    } else if (categoryParam) {
        query = query.where('category', '==', categoryParam);
    } else if (keywordParam) {
        // カウント用の処理を追加するか検討
    }

    try {
        const snapshot = await query.get();
        return snapshot.size;
    } catch (error) {
        console.error('Error counting projects:', error);
        return 0;
    }
}

async function loadInitialPage() {
    let query = firestore.collection("projectManagement");

    if (typeParam) {
        query = query.where('how_to_get', '==', typeParam);
        filteredProjects = await query.get().then(snapshot => snapshot.docs.map(doc => doc.data()));
        totalProjects = filteredProjects.length;
    } else if (categoryParam) {
        query = query.where('category', '==', categoryParam);
        filteredProjects = await query.get().then(snapshot => snapshot.docs.map(doc => doc.data()));
        totalProjects = filteredProjects.length;
    } else if (keywordParam) {
        filteredProjects = await searchProjectsByKeyword(keywordParam); // キーワードによる検索
        totalProjects = filteredProjects.length; // キーワード検索の総数
    } else {
        query = query.limit(20);
        const snapshot = await query.get();
        filteredProjects = snapshot.docs.map(doc => doc.data());
        totalProjects = filteredProjects.length;
    }

    try {
        // クライアント側でソートを適用
        filteredProjects = applyClientSideSorting(filteredProjects);
        displayData(filteredProjects.slice(0, pageSize)); // ページネーションの最初のページを表示
        lastVisible = filteredProjects.length > 0 ? filteredProjects[filteredProjects.length - 1] : null;
        firstVisible = filteredProjects.length > 0 ? filteredProjects[0] : null;

        document.querySelector('#prevPageButton').style.display = 'none';
    } catch (error) {
        console.error('Error fetching initial page:', error);
    }
}

async function loadNextPage() {
    if (!lastVisible) return;

    currentPage++;

    let query = firestore.collection("projectManagement")
        .orderBy(sortParam)
        .startAfter(lastVisible)
        .limit(pageSize);

    if (typeParam) {
        query = query.where('how_to_get', '==', typeParam);
    } else if (categoryParam) {
        query = query.where('category', '==', categoryParam);
    }

    try {
        const snapshot = await query.get();
        const newProjects = snapshot.docs.map(doc => doc.data());
        lastVisible = snapshot.docs[snapshot.docs.length - 1];
        filteredProjects.push(...newProjects);

        displayData(filteredProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize));
        document.querySelector('#prevPageButton').style.display = 'inline-block';
        document.querySelector('#nextPageButton').style.display = newProjects.length < pageSize ? 'none' : 'inline-block';
    } catch (error) {
        console.error('Error loading next page:', error);
    }
}

async function loadPreviousPage() {
    if (currentPage <= 1) return;

    currentPage--;

    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;

    displayData(filteredProjects.slice(start, end));

    document.querySelector('#prevPageButton').style.display = currentPage > 1 ? 'inline-block' : 'none';
    document.querySelector('#nextPageButton').style.display = 'inline-block';
}

async function countProjectsAll() {
    try {
        const snapshot = await countDocRef.get();
        if (snapshot.exists) {
            return snapshot.data().count;
        } else {
            console.warn('Count document does not exist.');
            return 0;
        }
    } catch (error) {
        console.error('Error counting all projects:', error);
        return 0;
    }
}

async function searchProjectsByKeyword(keyword) {
    let projects = [];

    try {
        const nameQuery = firestore.collection("projectManagement").where('name', '>=', keyword).where('name', '<=', keyword + '\uf8ff');
        const conditions1Query = firestore.collection("projectManagement").where('conditions1', '>=', keyword).where('conditions1', '<=', keyword + '\uf8ff');

        const [nameSnapshot, conditions1Snapshot] = await Promise.all([nameQuery.get(), conditions1Query.get()]);

        const nameProjects = nameSnapshot.docs.map(doc => doc.data());
        const conditions1Projects = conditions1Snapshot.docs.map(doc => doc.data());

        // nameProjects と conditions1Projects をマージして一意にする
        projects = [...nameProjects, ...conditions1Projects].filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.data_id === value.data_id
            ))
        );

        console.log('Projects found by keyword:', projects);
    } catch (error) {
        console.error('Error searching projects by keyword:', error);
    }

    return projects;
}

// ソートセレクトボックスの変更イベントリスナー
document.querySelector('select[name="order"]').addEventListener('change', function() {
    sortParam = this.value;
    currentPage = 1; // ソートが変更されたら最初のページに戻る
    filteredProjects = applyClientSideSorting(filteredProjects); // クライアント側でソート
    displayData(filteredProjects.slice(0, pageSize)); // 最初のページを再表示
});

// ページネーションボタンのイベントリスナー
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#nextPageButton').addEventListener('click', loadNextPage);
    document.querySelector('#prevPageButton').addEventListener('click', loadPreviousPage);
});
