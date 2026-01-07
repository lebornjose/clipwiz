import { PAGModule } from './pag-module';
import { PAGLayer } from './pag-layer';
import { destroyVerify, wasmAwaitRewind } from './utils/decorators';


@destroyVerify
@wasmAwaitRewind
export class PAGSolidLayer extends PAGLayer {
  /**
   * Make a empty PAGSolidLayer with specified size.
   */
  public static make(duration: number, width: number, height: number, solidColor: any, opacity: number) {
    const wasmIns = PAGModule._PAGSolidLayer._Make(duration, width, height, solidColor, opacity);
    if (!wasmIns) throw new Error('Make PAGSolidLayer fail!');
    return new PAGSolidLayer(wasmIns);
  }
  /**
   * Returns the layer's solid color.
   */
  public solidColor() {
    return this.wasmIns._solidColor();
  }
  /**
   * Set the the layer's solid color.
   */
  public setSolidColor(color: any) {
    this.wasmIns._setSolidColor(color);
  }
}
