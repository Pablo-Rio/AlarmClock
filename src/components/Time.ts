const SCALE = 2;
const FONT_SIZE = 90 * SCALE;
const DISTANCE_FROM_LEFT = 27 * SCALE;
const DISTANCE_BETWEEN_DIGITS = 12 * SCALE;
const DISTANCE_BETWEEN_COLONS_L = 5 * SCALE;
const DISTANCE_BETWEEN_COLONS_R = 10 * SCALE;
const DISTANCE_FROM_TOP = 100 * SCALE;
const WIDTH_OF_DIGIT = 42 * SCALE;
const WIDTH_OF_COLON = 9 * SCALE;

export default class Time {
  private ctx!: CanvasRenderingContext2D | null;
  private hours!: string;
  private minutes!: string;
  private time!: Date;
  private specifiedTime!: Date | undefined;

  private timeInterval: number = 0;

  constructor() {
    this.init();
  }

  init() {
    this.ctx = (
      document.getElementById("time") as HTMLCanvasElement
    ).getContext("2d");
    if (!this.ctx) return;
    this.ctx.canvas.width = 600;
    this.ctx.canvas.height = 300;
    this.ctx.font = `${FONT_SIZE}px frozencrystal`;
    this.ctx.fillStyle = "red";

    let fontLoad = new FontFace(
      "frozencrystal",
      "url(./fonts/frozencrystal.woff2)",
    );
    fontLoad.load().then((font) => {
      (document.fonts as any).add(font);
      this.updateTime();
    });
  }

  setSpecifiedTime(time: number | undefined) {
    if (time === undefined) {
      this.specifiedTime = undefined;
    } else {
      this.specifiedTime = new Date(time);
    }
  }

  updateTime() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, 600, 300);

    if (this.specifiedTime) {
      this.time = this.specifiedTime;
    } else {
      this.time = new Date();
    }
    this.hours = this.fillWithZero(this.time.getHours());
    this.minutes = this.fillWithZero(this.time.getMinutes());

    const hourFirstDigit = this.hours[0];
    const hourSecondDigit = this.hours[1];
    const minuteFirstDigit = this.minutes[0];
    const minuteSecondDigit = this.minutes[1];

    this.ctx.fillText(
      hourFirstDigit,
      DISTANCE_FROM_LEFT + this.fixPosition(hourFirstDigit),
      DISTANCE_FROM_TOP,
    );
    this.ctx.fillText(
      hourSecondDigit,
      DISTANCE_FROM_LEFT +
        WIDTH_OF_DIGIT +
        DISTANCE_BETWEEN_DIGITS +
        this.fixPosition(hourSecondDigit),
      DISTANCE_FROM_TOP,
    );
    if (this.time.getSeconds() % 2 === 0) {
      this.ctx.fillText(
        ":",
        DISTANCE_FROM_LEFT +
          2 * WIDTH_OF_DIGIT +
          DISTANCE_BETWEEN_COLONS_L +
          DISTANCE_BETWEEN_DIGITS,
        DISTANCE_FROM_TOP,
      );
    }
    this.ctx.fillText(
      minuteFirstDigit,
      DISTANCE_FROM_LEFT +
        2 * WIDTH_OF_DIGIT +
        DISTANCE_BETWEEN_COLONS_L +
        DISTANCE_BETWEEN_COLONS_R +
        DISTANCE_BETWEEN_DIGITS +
        WIDTH_OF_COLON +
        this.fixPosition(minuteFirstDigit),
      DISTANCE_FROM_TOP,
    );
    this.ctx.fillText(
      minuteSecondDigit,
      DISTANCE_FROM_LEFT +
        3 * WIDTH_OF_DIGIT +
        DISTANCE_BETWEEN_COLONS_L +
        DISTANCE_BETWEEN_COLONS_R +
        2 * DISTANCE_BETWEEN_DIGITS +
        WIDTH_OF_COLON +
        this.fixPosition(minuteSecondDigit),
      DISTANCE_FROM_TOP,
    );

    if (this.specifiedTime) {
      clearInterval(this.timeInterval);
      this.timeInterval = setTimeout(() => this.updateTime(), 5);
    } else {
      this.timeInterval = setTimeout(() => this.updateTime(), 1000);
    }
  }

  fillWithZero(time: number) {
    return time < 10 ? "0" + time.toString() : time.toString();
  }

  fixPosition(time: string) {
    if (time === "1") {
      return 15;
    }
    return 0;
  }

  public getContext() {
    return this.ctx;
  }
}
