//% weight=100 color="#27AE60" icon="\uf04e" block="ステップ実行"
namespace stepDebugger {
    // ---------- 内部状態 ----------
    let stepSignal = false;
    let waiting = false;

    // 向き: 0=East(+X) 1=South(+Z) 2=West(-X) 3=North(-Z)
    let currentDir = 1; // デフォルト：南

    const DIRECTIONS: CompassDirection[] = [
        CompassDirection.East,
        CompassDirection.South,
        CompassDirection.West,
        CompassDirection.North
    ];

    // ---------- チャット入力 ----------
    // 「n」または「next」で次のステップへ進む
    function onNext(): void {
        if (waiting) stepSignal = true;
    }
    player.onChat("n", onNext);
    player.onChat("next", onNext);

    // ---------- 内部関数 ----------
    function dirToIndex(dir: CompassDirection): number {
        for (let i = 0; i < DIRECTIONS.length; i++) {
            if (DIRECTIONS[i] === dir) return i;
        }
        return 1;
    }

    // 前・右・上の相対量を、現在の向きに応じたワールド座標の差分(絶対値)に変換
    function getFacingOffset(forward: number, right: number, up: number): Position {
        let dx = 0;
        let dz = 0;
        switch (currentDir) {
            case 0: dx = forward;  dz = right;    break; // 東向き
            case 1: dx = -right;   dz = forward;  break; // 南向き
            case 2: dx = -forward; dz = -right;   break; // 西向き
            default: dx = right;   dz = -forward; break; // 北向き
        }
        // pos() は相対座標になるため、加算用には絶対座標の createWorld を使う
        return positions.createWorld(dx, up, dz);
    }

    function targetFromAgent(offset: Position): Position {
        return positions.add(agent.getPosition(), offset);
    }

    // ---------- 公開ブロック ----------
    /**
     * チャットで「n」(または「next」)と打つまで処理を一時停止します
     * @param label ステップ番号, eg: 1
     */
    //% blockId=stepDebugger_waitStep
    //% block="ステップ待機 ステップ %label"
    //% label.defl=1
    //% weight=100
    export function waitStep(label: number): void {
        player.say("§e[一時停止] ステップ " + label + " (チャットに「n」で次へ)");
        stepSignal = false;
        waiting = true;

        while (!stepSignal) {
            loops.pause(100);
        }

        waiting = false;
        stepSignal = false;
        player.say("§a>> ステップ " + label + " を進めます");
    }

    /**
     * 指定したミリ秒だけ一時停止します
     * @param ms 待機時間（ミリ秒）, eg: 1000
     */
    //% blockId=stepDebugger_slowStep
    //% block="スロー実行 間隔 %ms ミリ秒"
    //% ms.defl=1000
    //% weight=95
    export function slowStep(ms: number): void {
        loops.pause(Math.max(0, ms));
    }

    /**
     * エージェントの向きを設定します（実際の向きも同期します）
     * @param dir 向いている方角
     */
    //% blockId=stepDebugger_setDirection
    //% block="エージェントの向きを設定 方角 %dir"
    //% weight=90
    export function setDirection(dir: CompassDirection): void {
        currentDir = dirToIndex(dir);
        agent.teleport(agent.getPosition(), dir);
    }

    /**
     * エージェントを旋回させます（向きデータも更新）
     * @param turnDir 回転方向
     */
    //% blockId=stepDebugger_turnAgent
    //% block="エージェントを旋回 %turnDir"
    //% weight=85
    export function turnAgent(turnDir: TurnDirection): void {
        if (turnDir === TurnDirection.Left) {
            currentDir = (currentDir + 3) % 4;
        } else {
            currentDir = (currentDir + 1) % 4;
        }
        agent.turn(turnDir);
    }

    /**
     * エージェントの向いている「前」へ瞬時に移動します（負の数で後退）
     * @param steps 前進歩数, eg: 1
     */
    //% blockId=stepDebugger_fastMoveForward
    //% block="エージェントを前に高速移動 歩数 %steps"
    //% steps.defl=1
    //% weight=80
    export function fastMoveForward(steps: number): void {
        const nextPos = targetFromAgent(getFacingOffset(steps, 0, 0));
        agent.teleport(nextPos, DIRECTIONS[currentDir]);
    }

    /**
     * エージェントから見た相対方向に瞬時にブロックを配置します
     * @param dir 設置方向, eg: SixDirection.Forward
     * @param block 設置するブロック, eg: Block.Stone
     */
    //% blockId=stepDebugger_fastPlaceBlock
    //% block="エージェントの %dir に高速ブロック設置 %block"
    //% block.shadow=minecraftBlock
    //% weight=75
    export function fastPlaceBlock(dir: SixDirection, block: Block): void {
        let offset: Position;
        switch (dir) {
            case SixDirection.Forward: offset = getFacingOffset(1, 0, 0);  break;
            case SixDirection.Back:    offset = getFacingOffset(-1, 0, 0); break;
            case SixDirection.Left:    offset = getFacingOffset(0, -1, 0); break;
            case SixDirection.Right:   offset = getFacingOffset(0, 1, 0);  break;
            case SixDirection.Up:      offset = getFacingOffset(0, 0, 1);  break;
            default:                   offset = getFacingOffset(0, 0, -1); break; // Down
        }
        blocks.place(block, targetFromAgent(offset));
    }
}
