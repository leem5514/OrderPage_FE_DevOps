import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { mdi } from 'vuetify/iconsets/mdi'

// 화이트 베이스의 프리미엄 모노크롬 테마
// 강조색은 흑/백/회색으로 통일하고, error(삭제/취소)에만 절제된 레드를 사용
const luxeLight = {
    dark: false,
    colors: {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        'surface-bright': '#FFFFFF',
        'surface-light': '#F6F6F4',
        'surface-variant': '#F1F0EC',
        'on-surface-variant': '#5B5B58',
        primary: '#141414',
        'on-primary': '#FFFFFF',
        secondary: '#6E6E6B',
        'on-secondary': '#FFFFFF',
        error: '#B3413A',
        'on-error': '#FFFFFF',
        success: '#3E7A5C',
        'on-success': '#FFFFFF',
        warning: '#A9762F',
        'on-warning': '#FFFFFF',
        info: '#51606B',
        'on-info': '#FFFFFF',
        'on-background': '#141414',
        'on-surface': '#141414',
        outline: '#E3E1DC',
    },
    variables: {
        'border-color': '#141414',
        'border-opacity': 0.1,
        'high-emphasis-opacity': 1,
        'medium-emphasis-opacity': 0.64,
    }
}

export default createVuetify({
    // components는 뷰티파이에서 사용할 수 있는 UI 컴포넌트들을 의미
    components,

    // directives는 뷰타파이에서 HTML 요소에 행동을 부여하는데 사용
    directives,
    icons: {
        defaultSet: 'mdi',
        sets: {
            mdi,
        }
    },
    theme: {
        defaultTheme: 'luxeLight',
        themes: {
            luxeLight
        }
    },
    defaults: {
        VAppBar: { flat: true },
        VFooter: { flat: true },
        VBtn: {
            variant: 'flat',
            rounded: 'sm',
            class: 'text-none font-weight-medium',
        },
        VCard: {
            variant: 'flat',
            rounded: 'lg',
            border: true,
        },
        VTextField: {
            variant: 'outlined',
            density: 'comfortable',
            color: 'primary',
        },
        VSelect: {
            variant: 'outlined',
            density: 'comfortable',
            color: 'primary',
        },
        VCheckbox: {
            color: 'primary',
            density: 'compact',
            hideDetails: true,
        },
        VTable: {
            density: 'comfortable',
        },
        VDataTable: {
            density: 'comfortable',
        },
        VDialog: {
            transition: 'fade-transition',
        },
        VChip: {
            rounded: 'pill',
        },
    }
});
