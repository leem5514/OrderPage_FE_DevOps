<template>
    <v-container class="py-8" style="max-width:1280px;">

      <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
        <div>
          <div class="section-eyebrow">PRODUCTS</div>
          <h1 class="text-h5 font-weight-bold mt-1">{{ pageTitle }}</h1>
        </div>
        <v-btn v-if="isAdmin" color="primary" prepend-icon="mdi-plus" href="/product/create">상품등록</v-btn>
      </div>

      <v-card class="mb-6 pa-4" variant="flat" border>
        <v-form @submit.prevent="searchProducts">
          <div class="d-flex flex-wrap align-center ga-3">
            <v-select
              v-model="searchType"
              :items="searchOptions"
              item-title="text"
              item-value="value"
              hide-details
              style="max-width:140px"
              @update:model-value="searchProducts"
            ></v-select>
            <v-text-field
              v-model="searchValue"
              placeholder="상품명을 검색해보세요"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              class="flex-grow-1 search-input"
            ></v-text-field>
            <v-btn type="submit" color="primary">검색</v-btn>

            <v-spacer class="d-none d-sm-block"></v-spacer>

            <v-btn-toggle v-model="viewMode" mandatory density="comfortable" color="primary" variant="outlined" divided>
              <v-btn value="grid" icon="mdi-view-grid-outline" size="small"></v-btn>
              <v-btn value="list" icon="mdi-view-agenda-outline" size="small"></v-btn>
            </v-btn-toggle>
          </div>
        </v-form>
      </v-card>

      <div v-if="!isAdmin" class="d-flex justify-end ga-2 mb-4">
        <v-btn variant="outlined" color="primary" @click="addCart">장바구니 담기</v-btn>
        <v-btn color="primary" @click="createOrder">바로 주문하기</v-btn>
      </div>

      <!-- 세로형 : 3열 그리드 -->
      <div v-if="viewMode === 'grid'" class="product-grid">
        <v-card v-for="p in productList" :key="p.id" variant="flat" border class="product-card">
          <div class="product-card-media">
            <v-img :src="p.imagePath" aspect-ratio="1" cover></v-img>
            <v-checkbox
              v-if="!isAdmin"
              v-model="selected[p.id]"
              class="product-card-check"
              hide-details
            ></v-checkbox>
          </div>
          <div class="pa-4">
            <div class="product-name">{{ p.name }}</div>
            <div class="product-price">{{ formatPrice(p.price) }}원</div>
            <div class="text-caption text-medium-emphasis mb-2">재고 {{ p.stockQuantity }}개</div>

            <div v-if="!isAdmin" class="qty-stepper mt-2">
              <v-btn icon size="x-small" variant="text" @click="decrement(p)">
                <v-icon icon="mdi-minus" size="16"></v-icon>
              </v-btn>
              <span class="qty-value">{{ p.quantity }}</span>
              <v-btn icon size="x-small" variant="text" @click="increment(p)">
                <v-icon icon="mdi-plus" size="16"></v-icon>
              </v-btn>
            </div>
            <v-btn v-else color="error" variant="outlined" size="small" block class="mt-3" @click="deleteProduct(p.id)">
              삭제
            </v-btn>
          </div>
        </v-card>
      </div>

      <!-- 가로형 : 리스트 -->
      <v-card v-else variant="flat" border>
        <div v-for="p in productList" :key="p.id" class="product-row">
          <v-img :src="p.imagePath" class="product-row-img" cover></v-img>
          <div class="product-row-info">
            <div class="product-name">{{ p.name }}</div>
            <div class="text-caption text-medium-emphasis">재고 {{ p.stockQuantity }}개</div>
          </div>
          <div class="product-price">{{ formatPrice(p.price) }}원</div>

          <div v-if="!isAdmin" class="d-flex align-center ga-4">
            <div class="qty-stepper">
              <v-btn icon size="x-small" variant="text" @click="decrement(p)">
                <v-icon icon="mdi-minus" size="16"></v-icon>
              </v-btn>
              <span class="qty-value">{{ p.quantity }}</span>
              <v-btn icon size="x-small" variant="text" @click="increment(p)">
                <v-icon icon="mdi-plus" size="16"></v-icon>
              </v-btn>
            </div>
            <v-checkbox v-model="selected[p.id]" hide-details></v-checkbox>
          </div>
          <v-btn v-else color="error" variant="outlined" size="small" @click="deleteProduct(p.id)">
            삭제
          </v-btn>
        </div>
      </v-card>

      <div v-if="productList.length === 0 && !isLoading" class="text-center py-16 text-medium-emphasis">
        등록된 상품이 없습니다.
      </div>
    </v-container>
  </template>

  <script>
  import axios from 'axios';
  export default {
    props: ['isAdmin', 'pageTitle'],
    data() {
      return {
        searchType: 'optional',
        searchOptions: [
          { text: '전체', value: 'optional' },
          { text: '상품명', value: 'name' },
          { text: '카테고리', value: 'category' },
        ],
        searchValue: "",
        productList: [],
        pageSize: 5,
        currentPage: 0,
        isLastPage: false,
        isLoading: false,
        selected: {},
        viewMode: 'grid'
      }
    },
    created() {
      this.loadProduct();
      window.addEventListener('scroll', this.scrollPagination)
    },
    beforeUnmount() {
      window.removeEventListener('scroll', this.scrollPagination);
    },
    methods: {
        async deleteProduct(productId) {
            const yesOrNo = confirm("해당 상품을 삭제하시겠습니까?");
            if (!yesOrNo) return;
            try {
                await axios.delete(`${process.env.VUE_APP_API_BASIC_URL}/product/${productId}`);
                this.productList = this.productList.filter(p => p.id !== productId);
            } catch (e) {
                console.log(e);
                alert(e.response?.data?.error_message || "상품 삭제에 실패했습니다.");
            }
        },

        formatPrice(price) {
            return Number(price || 0).toLocaleString('ko-KR');
        },

        increment(product) {
            if (product.quantity < product.stockQuantity) {
                product.quantity++;
            }
        },

        decrement(product) {
            if (product.quantity > 0) {
                product.quantity--;
            }
        },

        searchProducts() {
            this.productList = [];
            this.currentPage = 0;
            this.isLastPage = false;
            this.isLoading = false;
            this.loadProduct();
        },
        async loadProduct() {
            try {
            if (this.isLoading || this.isLastPage) return;

            this.isLoading = true;
            let params = {
                size: this.pageSize,
                page: this.currentPage,
            };

            if (this.searchType === 'name') {
                params.searchName = this.searchValue;
            } else if (this.searchType === 'category') {
                params.category = this.searchValue;
            }

            const response = await axios.get(`${process.env.VUE_APP_API_BASIC_URL}/product/list`, { params });
            const additionalData = response.data.result.content.map(p => ({ ...p, quantity: 0 }));

            if (additionalData.length == 0) {
                this.isLastPage = true;
                return;
            }

            this.productList = [...this.productList, ...additionalData]
            this.currentPage++;
            this.isLoading = false;
            } catch (e) {
            console.log(e)
            } finally {
                this.isLoading = false;
            }
        },

        scrollPagination() {
            const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
            if (isBottom && !this.isLastPage && !this.isLoading) {
            this.loadProduct();
            }
        },

        addCart() {
            const orderProducts = Object.keys(this.selected).filter(key => this.selected[key])
            .map(key => {
                const product = this.productList.find(p => p.id == key)
                return { id: product.id, name: product.name, quantity: product.quantity };
            });
            orderProducts.forEach(p => this.$store.dispatch('addCart', p))
            window.location.reload();
        },

        async createOrder() {
            const orderProducts = Object.keys(this.selected).filter(key => this.selected[key]).map(key => {
                const product = this.productList.find(p => p.id == key)
                return { productId: product.id, productCount: product.quantity };
            });
            if (orderProducts.length < 1) {
                alert("주문대상 물건이 없습니다.");
                return;
            }
            const yesOrNo = confirm(`${orderProducts.length}개의 상품을 준비하시겠습니까?`);
                if (!yesOrNo) {
                console.log("주문이 취소되었습니다.");
                return;
            }
            try {
                await axios.post(`${process.env.VUE_APP_API_BASIC_URL}/order/create`, orderProducts);
                alert("주문 성공하였습니다");
                this.selected = {};
                this.productList.forEach(p => p.quantity = 0);
            } catch (e) {
                console.log(e);
                alert("주문 실패하였습니다.");
            }
        }
    }
  }
  </script>

  <style scoped>
  .search-input :deep(input) {
    letter-spacing: 0;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  @media (max-width: 900px) {
    .product-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .product-grid {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  .product-card {
    overflow: hidden;
  }

  .product-card-media {
    position: relative;
  }

  .product-card-check {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 50%;
    padding: 2px;
  }

  .product-name {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .product-price {
    font-size: 15px;
    font-weight: 700;
    margin-top: 2px;
  }

  .qty-stepper {
    display: inline-flex;
    align-items: center;
    border: 1px solid rgba(20, 20, 20, 0.16);
    border-radius: 999px;
    padding: 2px 4px;
  }

  .qty-value {
    min-width: 24px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
  }

  .product-row {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(20, 20, 20, 0.08);
  }

  .product-row:last-child {
    border-bottom: none;
  }

  .product-row-img {
    width: 76px;
    height: 76px;
    flex: none;
    border-radius: 8px;
    border: 1px solid rgba(20, 20, 20, 0.1);
  }

  .product-row-info {
    flex: 1 1 auto;
    min-width: 0;
  }

  .product-row-info .product-name {
    white-space: normal;
  }

  .product-row .product-price {
    flex: none;
    width: 110px;
  }
  </style>
