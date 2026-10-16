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
     * エージェントのアニメーションを待たずに高速移動させます
     * @param steps 前進する歩数, eg: 5
     */
    //% block="エージェントを前に瞬間移動 [歩数 %steps]"
    //% weight=80
    export function instantMoveForward(steps: number): void {
        let targetPos = positions.add(
            agent.getPosition(),
            posCamera(0, 0, steps)
        );
        agent.teleport(targetPos, CompassDirection.North);
    }

    /**
     * エージェントの足元・前などに瞬時にブロックを配置します（アニメーションなし）
     * @param block 設置するブロック, eg: Block.Stone
     * @param dir 設置方向, eg: SixDirection.Down
     */
    //% block="エージェントの %dir に高速ブロック設置 %block"
    //% weight=75
    export function instantPlaceBlock(dir: SixDirection, block: Block): void {
        let agentPos = agent.getPosition();
        let targetPos: Position;

        // 指定した方向の座標を算出
        if (dir === SixDirection.Down) {
            targetPos = positions.add(agentPos, pos(0, -1, 0));
        } else if (dir === SixDirection.Up) {
            targetPos = positions.add(agentPos, pos(0, 1, 0));
        } else if (dir === SixDirection.Forward) {
            targetPos = positions.add(agentPos, posCamera(0, 0, 1));
        } else if (dir === SixDirection.Back) {
            targetPos = positions.add(agentPos, posCamera(0, 0, -1));
        } else if (dir === SixDirection.Left) {
            targetPos = positions.add(agentPos, posCamera(-1, 0, 0));
        } else {
            targetPos = positions.add(agentPos, posCamera(1, 0, 0));
        }

        // 即時配置
        blocks.place(block, targetPos);
    }

    /**
     * 指定歩数進みながら足元に連続でブロックを高速設置（道作りなど）
     * @param steps 長さ（ブロック数）, eg: 5
     * @param block 敷くブロック, eg: Block.Cobblestone
     */
    //% block="足元にブロックを敷きながら高速直進 [歩数 %steps] [ブロック %block]"
    //% weight=70
    export function fastBuildPath(steps: number, block: Block): void {
        for (let i = 0; i < steps; i++) {
            let nextPos = positions.add(agent.getPosition(), posCamera(0, 0, 1));
            agent.teleport(nextPos, CompassDirection.North);
            blocks.place(block, positions.add(nextPos, pos(0, -1, 0)));
            loops.pause(10); // 描画更新の最小ウェイト
        }
    }
}
