//% weight=100 color="#27AE60" icon="\uf04e" block="ステップ実行"
namespace stepDebugger {
    let stepSignal = false;

    // 0: East (+X), 1: South (+Z), 2: West (-X), 3: North (-Z)
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

    function getCompassEnum(): CompassDirection {
        if (currentDir === 0) return CompassDirection.East;
        if (currentDir === 1) return CompassDirection.South;
        if (currentDir === 2) return CompassDirection.West;
        return CompassDirection.North;
    }

    /**
     * エージェントの向きを初期設定します
     * @param dir 向かせる方角
     */
    //% block="エージェントの向きを設定 [方角 %dir]"
    //% weight=90
    export function setDirection(dir: CompassDirection): void {
        if (dir === CompassDirection.East) currentDir = 0;
        else if (dir === CompassDirection.South) currentDir = 1;
        else if (dir === CompassDirection.West) currentDir = 2;
        else if (dir === CompassDirection.North) currentDir = 3;

        agent.teleport(agent.getPosition(), dir);
    }

    /**
     * エージェントのアニメーションを待たずに瞬時に旋回（方向転換）させます
     * @param turnDir 回転方向, eg: TurnDirection.Left
     */
    //% block="エージェントを瞬時に旋回 %turnDir"
    //% weight=85
    export function fastTurn(turnDir: TurnDirection): void {
        if (turnDir === TurnDirection.Left) {
            currentDir = (currentDir + 3) % 4; // 左回転 (-1)
        } else {
            currentDir = (currentDir + 1) % 4; // 右回転 (+1)
        }
        // アニメーション待機のある agent.turn() は使わず、瞬時に向きのみテレポート更新
        agent.teleport(agent.getPosition(), getCompassEnum());
    }

    // 内部関数：エージェントの向きに応じた相対オフセット計算
    function getFacingOffset(forward: number, right: number, up: number): Position {
        let dx = 0;
        let dz = 0;

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
     * エージェントを指定した方向へ瞬時に移動させます（アニメーションなし）
     * @param dir 移動方向, eg: SixDirection.Forward
     * @param steps 歩数, eg: 1
     */
    //% block="エージェントを %dir へ高速移動 [歩数 %steps]"
    //% weight=80
    export function fastMoveDirection(dir: SixDirection, steps: number): void {
        let offset: Position;

        if (dir === SixDirection.Forward) {
            offset = getFacingOffset(steps, 0, 0);
        } else if (dir === SixDirection.Back) {
            offset = getFacingOffset(-steps, 0, 0);
        } else if (dir === SixDirection.Left) {
            offset = getFacingOffset(0, -steps, 0);
        } else if (dir === SixDirection.Right) {
            offset = getFacingOffset(0, steps, 0);
        } else if (dir === SixDirection.Up) {
            offset = pos(0, steps, 0);
        } else { // Down
            offset = pos(0, -steps, 0);
        }

        let nextPos = positions.add(agent.getPosition(), offset);
        agent.teleport(nextPos, getCompassEnum());
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
