import { useThemeVars } from 'naive-ui';
import { defineStore } from 'pinia';
import WaveSurfer from 'wavesurfer.js';
import WaveSurferTimeline from 'wavesurfer.js/src/plugin/timeline';
import WaveSurferCursor from 'wavesurfer.js/src/plugin/cursor';
import WaveSurferRegions from 'wavesurfer.js/src/plugin/regions';
import { getSubtitlesReq, updateSubtitleForTransfyReq } from '/@/api/Admin/TransfyAi/Transfy';
import { SubtitlesItem } from '/@/global-enums/subtitles.enum';
import { TransfyDTO } from '/@/types/Admin/Transfy/dto';

interface TransfyState {
  transfy: TransfyDTO;
  subtitles: SubtitlesItem[];
  videoLoaded: boolean;
  subtitlesLoading: boolean;
  waveId: number;
  wavesurferContainer: string;
  wavesurferLoading: boolean;
  wavesurferReady: boolean;
}

export const useTransfyStore = defineStore({
  id: 'transfy',
  state: (): TransfyState => ({
    transfy: new TransfyDTO(),
    subtitles: [],
    videoLoaded: false,
    subtitlesLoading: false,
    wavesurferContainer: '#waveform',
    waveId: 0,
    wavesurferLoading: false,
    wavesurferReady: false,
  }),
  getters: {
    wavesurfer(state): WaveSurfer {
      const themeVars = useThemeVars();
      const wavesurfer = WaveSurfer.create({
        container: state.wavesurferContainer,
        backend: 'MediaElement',
        height: 120,
        normalize: true,
        splitChannels: false,
        waveColor: themeVars.value.primaryColor,
        progressColor: themeVars.value.infoColor,
        cursorColor: themeVars.value.infoColor,
        minPxPerSec: 100,
        barGap: 5,
        barHeight: 1,
        barRadius: 2,
        barWidth: 5,
        scrollParent: true,
        plugins: [
          WaveSurferTimeline.create({
            container: '#wave-timeline',
            primaryColor: themeVars.value.primaryColor,
            primaryFontColor: themeVars.value.textColorBase,
            secondaryFontColor: themeVars.value.textColor1,
            fontFamily: themeVars.value.fontFamily,
          }),
          WaveSurferCursor.create({
            color: themeVars.value.textColorBase,
          }),
          WaveSurferRegions.create({
            dragSelection: false,
            regionsMinLength: 1,
            regions: [],
          }),
        ],
      });
      wavesurfer.on('ready', () => {
        console.log('wavesurfer ready');
        this.wavesurferReady = true;
        this.wavesurferLoading = false;
      });
      wavesurfer.on('play', () => {
        console.log('wavesurfer play');
      });
      wavesurfer.on('pause', () => {
        console.log('wavesurfer pause');
      });
      wavesurfer.on('region-click', (region) => {
        // e.stopPropagation();
        // Play on click, loop on shift click
        // e.shiftKey ? region.playLoop() : region.play();
        // console.log(region);
        this.waveId = region.id;
      });
      wavesurfer.on('region-in', (region) => {
        this.waveId = region.id;
      });
      wavesurfer.on('region-out', (region) => {
        this.waveId = region.id;
      });
      setTimeout(() => {
        wavesurfer.load(document.querySelector('#MediaRef') as HTMLMediaElement);
      }, 1000);
      return wavesurfer;
    },
  },
  actions: {
    async setMediaTime(ms: number, id: number) {
      if (this.waveId !== id) {
        const s = ms / 1000;
        await this.wavesurfer.play(s);
        this.wavesurfer.pause();
        this.waveId = id;
        window.$message.info(`跳转到 ${ms}ms`);
      }
    },
    setSubtitlesFSentence(value: string, id: number) {
      const itemIdx = this.subtitles.findIndex((m) => m.id === id);
      this.subtitles[itemIdx].FinalSentence = value;
    },
    setSubtitles(subtitles: SubtitlesItem[]) {
      this.subtitles = subtitles;
    },
    setTransfy(transfy: TransfyDTO) {
      this.transfy = transfy;
    },
    // setMediaElt(mediaElt: HTMLMediaElement) {
    //   this.mediaElt = mediaElt;
    // },
    setwavesurferReady(wavesurferReady: boolean) {
      this.wavesurferReady = wavesurferReady;
    },
    async saveSubtitles() {
      const { payload } = await updateSubtitleForTransfyReq(this.transfy.id, this.subtitles);
      return payload;
    },

    // async exportSubtitles() {
    //   const srtString = buildFile(this.subtitles);
    //   stringDownload(srtString, `${this.transfy.name}.srt`);
    // },
    async loadSubtitles() {
      this.subtitlesLoading = true;
      setTimeout(async () => {
        const res = await getSubtitlesReq(this.transfy.recResJsonUrl);
        this.subtitlesLoading = false;
        this.setSubtitles(
          res.map((m, i) => {
            return {
              ...m,
              id: i + 1,
            };
          })
        );
      }, 1000);
    },
  },
});
