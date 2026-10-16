//% weight=100 color="#27AE60" icon="\uf04e" block="ステップ実行"
namespace stepDebugger {
    let stepSignal = false;

    // 初期状態はマインクラフト標準の南(South=1)または東(East=0)
    // 0: East, 1: South, 2: West, 3: North
    let currentDir = 1; // デフォルト：南

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
     * エージェントの現在の向きを設定します
     * @param dir 向いている方角
     */
    //% block="エージェントの向きを設定 [方角 %dir]"
    //% weight=90
    export function setDirection(dir: CompassDirection): void {
        if (dir === CompassDirection.East) currentDir = 0;
        else if (dir === CompassDirection.South) currentDir = 1;
        else if (dir === CompassDirection.West) currentDir = 2;
        else if (dir === CompassDirection.North) currentDir = 3;

        // 向きを直接同期
        agent.teleport(agent.getPosition(), dir);
    }

    /**
     * エージェントを旋回させます（向きデータも更新）
     * @param turnDir 回転方向
     */
    //% block="エージェントを旋回 %turnDir"
    //% weight=85
    export function turnAgent(turnDir: TurnDirection): void {
        if (turnDir === TurnDirection.Left) {
            currentDir = (currentDir + 3) % 4; // -1相当
            agent.turn(TurnDirection.Left);
        } else {
            currentDir = (currentDir + 1) % 4; // +1相当
            agent.turn(TurnDirection.Right);
        }
    }

    // 内部関数：エージェントの向きに基づいた前・右・上のオフセット計算
    function getFacingOffset(forward: number, right: number, up: number): Position {
        let dx = 0;
        let dz = 0;

        // 0: East (+X), 1: South (+Z), 2: West (-X), 3: North (-Z)
        if (currentDir === 0) { // 東向き
            dx = forward;
            dz = right;
        } else if (currentDir === 1) { // 南向き
            dx = -right;
            dz = forward;
        } else if (currentDir === 2) { // 西向き
            dx = -forward;
            dz = -right;
        } else if (currentDir === 3) { // 北向き
            dx = right;
            dz = -forward;
        }

        return pos(dx, up, dz);
    }

    /**
     * エージェントの向いている「前」へ瞬時に移動させます
     * @param steps 前進歩数, eg: 1
     */
    //% block="エージェントを前に高速移動 [歩数 %steps]"
    //% weight=80
    export function fastMoveForward(steps: number): void {
        let offset = getFacingOffset(steps, 0, 0);
        let nextPos = positions.add(agent.getPosition(), offset);
        // 方角引数を省略し、エージェント自身の現在の向きを維持
        agent.teleport(nextPos, currentDir === 0 ? CompassDirection.East : (currentDir === 1 ? CompassDirection.South : (currentDir === 2 ? CompassDirection.West : CompassDirection.North)));
    }

    /**
     * エージェントから見た相対方向に瞬時にブロックを配置します
     * @param dir 設置方向, eg: SixDirection.Forward
     * @param block 設置するブロック, eg: Block.Stone
     */
    //% block="エージェントの %dir に高速ブロック設置 %block"
    //% weight=75
    export function fastPlaceBlock(dir: SixDirection, block: Block): void {
        let offset: Position;

        if (dir === SixDirection.Forward) {
            offset = getFacingOffset(1, 0, 0);
        } else if (dir === SixDirection.Back) {
            offset = getFacingOffset(-1, 0, 0);
        } else if (dir === SixDirection.Left) {
            offset = getFacingOffset(0, -1, 0);
        } else if (dir === SixDirection.Right) {
            offset = getFacingOffset(0, 1, 0);
        } else if (dir === SixDirection.Up) {
            offset = pos(0, 1, 0);
        } else { // Down
            offset = pos(0, -1, 0);
        }

        let targetPos = positions.add(agent.getPosition(), offset);
        blocks.place(block, targetPos);
    }
}
