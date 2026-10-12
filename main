//% weight=100 color=#27AE60 icon="\uf04e" block="ステップ実行"
namespace stepDebugger {
    let stepSignal = false;
    let initialized = false;
    let stepCounter = 0;

    // 初期化：アイテム使用イベントを登録
    function setupListener() {
        if (initialized) return;
        initialized = true;

        // 木の棒（Stick）を使用した（右クリックした）時
        player.onItemInteracted(STICK, function () {
            stepSignal = true;
        });
    }

    /**
     * デバッグ用のコントローラーアイテム（棒）をプレイヤーに付与します
     */
    //% block="デバッグ棒を受け取る"
    //% weight=100
    export function giveDebugStick(): void {
        setupListener();
        mobs.give(mobs.target(NEAREST_PLAYER), STICK, 1);
        player.say("§a[デバッガー] 棒を受け取りました。右クリックで1ステップ進めます。");
    }

    /**
     * 棒を右クリックするまで待機し、次のステップへ進めます
     * @param label 現在のステップ名や説明, eg: "1"
     */
    //% block="ステップ待機 [ステップ %label]"
    //% weight=90
    export function waitStep(label: string): void {
        setupListener();
        stepCounter++;
        stepSignal = false;

        // 画面中央に案内を表示
        player.execute(`titleraw @s actionbar {"rawtext":[{"text":"§e[PAUSE] ステップ ${label} : 棒を右クリックで次へ"}]}`);
        player.say(`§6[一時停止] ステップ: ${label}`);

        // 棒が使われるまでループで待機
        while (!stepSignal) {
            loops.pause(50);
        }

        // 次に進む処理
        stepSignal = false;
        player.execute(`titleraw @s actionbar {"rawtext":[{"text":"§a>> 実行中..."}]}`);
    }

    /**
     * 指定したミリ秒だけ一時停止する（自動スローモード用）
     * @param ms 停止時間（ミリ秒）, eg: 1000
     */
    //% block="スロー実行 [間隔 %ms ミリ秒]"
    //% weight=80
    export function slowStep(ms: number): void {
        loops.pause(ms);
    }

    /**
     * 変数の内容をアクションバーやチャットに表示します
     * @param name 変数名, eg: "count"
     * @param val 変数の値
     */
    //% block="変数を表示 %name = %val"
    //% weight=70
    export function watch(name: string, val: any): void {
        player.say(`§b[WATCH] ${name} = ${val}`);
    }
}
