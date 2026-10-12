//% weight=100 color="#27AE60" icon="\uf04e" block="ステップ実行"
namespace stepDebugger {
    let stepSignal = false;

    // 木の棒（stick）を使用したときにフラグを立てる
    player.onItemInteracted(Item.Stick, function () {
        stepSignal = true;
    });

    /**
     * デバッグ用の木の棒をプレイヤーに渡します
     */
    //% block="デバッグ棒を受け取る"
    //% weight=100
    export function giveStick(): void {
        mobs.give(mobs.target(TargetSelector.NearestPlayer), Item.Stick, 1);
        player.say("§a[デバッガー] 木の棒を右クリックすると1ステップ進みます");
    }

    /**
     * 木の棒を右クリックするまで処理を待機します
     * @param label ステップ番号や名前, eg: 1
     */
    //% block="ステップ待機 [ステップ %label]"
    //% weight=90
    export function waitStep(label: number): void {
        player.say("§e[一時停止] ステップ " + label + " : 棒を右クリックで次へ");
        stepSignal = false;

        // 右クリックされるまで50ミリ秒ごとに確認して待つ
        while (!stepSignal) {
            loops.pause(50);
        }

        stepSignal = false;
        player.say("§a>> ステップ " + label + " を実行中...");
    }

    /**
     * 指定した秒数（ミリ秒）だけ一時停止します
     * @param ms 待ち時間（ミリ秒）, eg: 1000
     */
    //% block="スロー実行 [間隔 %ms ミリ秒]"
    //% weight=80
    export function slowStep(ms: number): void {
        loops.pause(ms);
    }
}
