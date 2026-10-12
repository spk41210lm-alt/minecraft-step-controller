//% weight=100 color="#27AE60" icon="\uf04e" block="ステップ実行"
namespace stepDebugger {
    let stepSignal = false;
    let agentSpeedDelay = 50; // 高速時のウェイト（ミリ秒）

    // チャットで "n" と打つと1ステップ進む
    player.onChat("n", function () {
        stepSignal = true;
    });

    /**
     * チャットで「n」と打つまで処理を一時停止します
     * @param label ステップ番号, eg: 1
     */
    //% block="ステップ待機 [ステップ %label]"
    //% weight=100
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
    //% weight=90
    export function slowStep(ms: number): void {
        loops.pause(ms);
    }

    /**
     * エージェントを指定した歩数分、高速に前進させます
     * @param steps 前進する歩数, eg: 1
     */
    //% block="エージェントを高速に前に進める [歩数 %steps]"
    //% weight=80
    export function fastMoveForward(steps: number): void {
        for (let i = 0; i < steps; i++) {
            agent.move(SixDirection.Forward, 1);
            loops.pause(agentSpeedDelay);
        }
    }

    /**
     * 高速実行時の動作間隔（ミリ秒）を設定します（標準は50ms）
     * @param delay 動作間隔（ミリ秒）, eg: 50
     */
    //% block="エージェントの速度を設定 [間隔 %delay ミリ秒]"
    //% weight=70
    export function setAgentSpeed(delay: number): void {
        agentSpeedDelay = delay;
    }
}
