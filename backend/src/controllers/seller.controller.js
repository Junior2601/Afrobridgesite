const SellerService = require('../services/seller.service');

const respond = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, err) => res.status(err.status ?? 500).json({ success: false, message: err.message ?? 'Erreur serveur.' });

// POST /vendeurs
const createSeller = async (req, res) => {
  essayer {
    const vendeur = await SellerService.createSeller(req.body);
    répondre(res, vendeur, 201);
  } catch (err) { fail(res, err); }
};

// GET /sellers
const getAllSellers = async (req, res) => {
  essayer {
    const vendeurs = await SellerService.getAllSellers({ page: +req.query.page || 1, limit: +req.query.limit || 20 });
    répondre(res, vendeurs);
  } catch (err) { fail(res, err); }
};

// GET /sellers/:id
const getSellerById = async (req, res) => {
  essayer {
    const vendeur = await SellerService.getSellerById(+req.params.id);
    répondre(res, vendeur);
  } catch (err) { fail(res, err); }
};

// PATCH /sellers/:id
const updateSeller = async (req, res) => {
  essayer {
    const vendeur = await SellerService.updateSeller(+req.params.id, req.body);
    répondre(res, vendeur);
  } catch (err) { fail(res, err); }
};

// GET /sellers/:id/products
const getSellerProducts = async (req, res) => {
  essayer {
    const produits = await SellerService.getSellerProducts(+req.params.id, req.query);
    répondre(res, produits);
  } catch (err) { fail(res, err); }
};

// GET /sellers/:id/services
const getSellerServices = async (req, res) => {
  essayer {
    const services = await SellerService.getSellerServices(+req.params.id, req.query);
    répondre(res, services);
  } catch (err) { fail(res, err); }
};

// GET /sellers/:id/payouts
const getSellerPayouts = async (req, res) => {
  essayer {
    const payouts = await SellerService.getSellerPayouts(+req.params.id);
    répondre(res, paiements);
  } catch (err) { fail(res, err); }
};

module.exports = { createSeller, getAllSellers, getSellerById, updateSeller, getSellerProducts, getSellerServices, getSellerPayouts };