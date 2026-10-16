//% weight=100 color="#27AE60" icon="\uf04e" block="ステップ実行"
namespace stepDebugger {
    let stepSignal = false;

    // エージェントの現在の向き（デフォルト: 東=0, 南=1, 西=2, 北=3）
    // Minecraftの標準仕様に合わせて管理
    let agentHeading = CompassDirection.East;

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
    //% weight=95
    export function slowStep(ms: number): void {
        loops.pause(ms);
    }

    /**
     * エージェントの向きを初期設定します
     * @param dir 向かせる方角, eg: CompassDirection.East
     */
    //% block="エージェントの向きを初期化 [方角 %dir]"
    //% weight=90
    export function setHeading(dir: CompassDirection): void {
        agentHeading = dir;
        agent.teleport(agent.getPosition(), agentHeading);
    }

    /**
     * エージェントを高速に旋回させます
     * @param turnDir 回転方向, eg: TurnDirection.Left
     */
    //% block="エージェントを瞬時に旋回 %turnDir"
    //% weight=85
    export function instantTurn(turnDir: TurnDirection): void {
        // 北(3) -> 東(0) -> 南(1) -> 西(2)
        if (turnDir === TurnDirection.Left) {
            if (agentHeading === CompassDirection.North) agentHeading = CompassDirection.West;
            else if (agentHeading === CompassDirection.West) agentHeading = CompassDirection.South;
            else if (agentHeading === CompassDirection.South) agentHeading = CompassDirection.East;
            else agentHeading = CompassDirection.North;
        } else {
            if (agentHeading === CompassDirection.North) agentHeading = CompassDirection.East;
            else if (agentHeading === CompassDirection.East) agentHeading = CompassDirection.South;
            else if (agentHeading === CompassDirection.South) agentHeading = CompassDirection.West;
            else agentHeading = CompassDirection.North;
        }
        agent.teleport(agent.getPosition(), agentHeading);
    }

    // 内部関数：エージェントの向いている方向に基づいた相対オフセットを計算
    function getOffsetPosition(basePos: Position, forwardSteps: number, rightSteps: number, upSteps: number): Position {
        let dx = 0;
        let dz = 0;

        // 東(+X), 西(-X), 南(+Z), 北(-Z)
        if (agentHeading === CompassDirection.East) {
            dx = forwardSteps;
            dz = rightSteps;
        } else if (agentHeading === CompassDirection.West) {
            dx = -forwardSteps;
            dz = -rightSteps;
        } else if (agentHeading === CompassDirection.South) {
            dz = forwardSteps;
            dx = -rightSteps;
        } else if (agentHeading === CompassDirection.North) {
            dz = -forwardSteps;
            dx = rightSteps;
        }

        return positions.add(basePos, pos(dx, upSteps, dz));
    }

    /**
     * エージェントの向いている「前」へ瞬時に移動させます
     * @param steps 前進歩数, eg: 1
     */
    //% block="エージェントを向いている前へ高速移動 [歩数 %steps]"
    //% weight=80
    export function instantMoveForward(steps: number): void {
        let nextPos = getOffsetPosition(agent.getPosition(), steps, 0, 0);
        agent.teleport(nextPos, agentHeading);
    }

    /**
     * エージェント基準の相対方向（前/後ろ/左/右/上/下）に瞬時にブロックを配置します
     * @param dir 設置方向, eg: SixDirection.Forward
     * @param block 設置するブロック, eg: Block.Stone
     */
    //% block="エージェントから見て %dir に高速ブロック設置 %block"
    //% weight=75
    export function instantPlaceRelative(dir: SixDirection, block: Block): void {
        let agentPos = agent.getPosition();
        let targetPos: Position;

        if (dir === SixDirection.Forward) {
            targetPos = getOffsetPosition(agentPos, 1, 0, 0);
        } else if (dir === SixDirection.Back) {
            targetPos = getOffsetPosition(agentPos, -1, 0, 0);
        } else if (dir === SixDirection.Left) {
            targetPos = getOffsetPosition(agentPos, 0, -1, 0);
        } else if (dir === SixDirection.Right) {
            targetPos = getOffsetPosition(agentPos, 0, 1, 0);
        } else if (dir === SixDirection.Up) {
            targetPos = getOffsetPosition(agentPos, 0, 0, 1);
        } else { // Down
            targetPos = getOffsetPosition(agentPos, 0, 0, -1);
        }

        blocks.place(block, targetPos);
    }

    /**
     * 向いている前方に進みながら足元にブロックを高速で敷き詰めます
     * @param steps 歩数, eg: 5
     * @param block 敷くブロック, eg: Block.Cobblestone
     */
    //% block="向いている前方に敷き詰めながら高速直進 [歩数 %steps] [ブロック %block]"
    //% weight=70
    export function fastBuildPath(steps: number, block: Block): void {
        for (let i = 0; i < steps; i++) {
            let nextPos = getOffsetPosition(agent.getPosition(), 1, 0, 0);
            agent.teleport(nextPos, agentHeading);
            blocks.place(block, positions.add(nextPos, pos(0, -1, 0)));
            loops.pause(10);
        }
    }
}
