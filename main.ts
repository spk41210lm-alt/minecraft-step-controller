//% weight=100 color="#27AE60" icon="\uf04e" block="ステップ実行"
namespace stepDebugger {
    let stepSignal = false;

    player.onChat("n", function () {
        stepSignal = true;
    });

    /**
     * チャットで「n」と打つまで処理を一時停止します
     * @param label ステップ番号, eg: 1
     */
    //% block="ステップ待機 [ステップ %label]"
    //% weight=90
    export function waitStep(label: number): void {
        player.say("§e[一時停止] ステップ " + label + " (チャットに「n」で次へ)");
        stepSignal = false;

        while (!stepSignal) {
            loops.pause(100);
        }

        stepSignal = false;
        player.say("§a>> ステップ " + label + " を進めます");
    }

    /**
     * 指定したミリ秒だけ一時停止します
     * @param ms 待機時間（ミリ秒）, eg: 1000
     */
    //% block="スロー実行 [間隔 %ms ミリ秒]"
    //% weight=80
    export function slowStep(ms: number): void {
        loops.pause(ms);
    }

    /**
     * エージェントのアニメーションを待たずに高速移動させます
     * @param blocks 移動歩数, eg: 1
     */
    //% block="エージェントを前に高速移動 [歩数 %blocks]"
    //% weight=70
    export function fastMoveForward(blocks: number): void {
        for (let i = 0; i < blocks; i++) {
            // 通常の agent.move() よりウェイトを最小限に抑える呼び出し
            player.execute(`execute as @c at @s run tp @s ^ ^ ^1`);
            loops.pause(20); // 1tick分の最小ウェイト
        }
    }

    /**
     * エージェントを瞬時に指定した歩数進めます（テレポート移動）
     * @param blocks 移動歩数, eg: 1
     */
    //% block="エージェントを瞬時に [歩数 %blocks] 歩 前へテレポート"
    //% weight=60
    export function instantMoveForward(blocks: number): void {
        player.execute(`execute as @c at @s run tp @s ^ ^ ^${blocks}`);
    }
}
