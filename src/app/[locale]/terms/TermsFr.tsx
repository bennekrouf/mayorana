'use client';

import React from 'react';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { motion } from '@/components/ui/Motion';

export default function TermsFr() {
  return (
    <LayoutTemplate>
      <div className="py-20 bg-background">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-6">Conditions d&apos;utilisation</h1>
            <p className="text-muted-foreground mb-8">Dernière mise à jour : 6 octobre 2026</p>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Acceptation des conditions</h2>
                <p>
                  En accédant au site Mayorana (mayorana.ch) et en l&apos;utilisant, vous acceptez d&apos;être lié par les présentes
                  Conditions d&apos;utilisation («&nbsp;Conditions&nbsp;»). Elles régissent votre utilisation du site et des logiciels
                  qui y sont téléchargés. Mayorana est une entreprise suisse de logiciels.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Nos produits</h2>
                <p className="mb-4">Mayorana conçoit et distribue&nbsp;:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>api0</strong>, une passerelle MCP fournie sur api0.ai. Votre utilisation d&apos;api0 est régie par les{' '}
                    <a href="https://api0.ai/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">conditions d&apos;utilisation d&apos;api0</a>,
                    et non par les présentes Conditions.
                  </li>
                  <li>
                    <strong>Des outils de bureau</strong> pour Azure Integration Services, Git et d&apos;autres usages, téléchargeables
                    sur ce site. Leur utilisation est régie par les licences décrites ci-dessous, sous «&nbsp;Licences des logiciels&nbsp;».
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Utilisation du site</h2>
                <p className="mb-4">
                  Vous pouvez consulter et télécharger les contenus de ce site (articles, pages et images) à des fins
                  personnelles et non commerciales. Il s&apos;agit d&apos;une licence et non d&apos;un transfert de titre. À ce titre,
                  vous ne pouvez pas&nbsp;:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Republier les articles ou pages du site comme les vôtres, en tout ou en partie substantielle</li>
                  <li>Utiliser les contenus à des fins commerciales ou pour un affichage public</li>
                  <li>Supprimer les mentions de droits d&apos;auteur ou autres mentions de propriété</li>
                </ul>
                <p className="mt-4">
                  Cette licence ne couvre pas les logiciels téléchargeables, qui font l&apos;objet d&apos;une licence distincte (voir
                  ci-dessous). Elle est automatiquement résiliée si vous enfreignez ces restrictions et peut être révoquée par
                  Mayorana à tout moment.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Licences des logiciels</h2>
                <p className="mb-4">
                  Les outils de bureau sont à source disponible sous la{' '}
                  <a href="https://polyformproject.org/licenses/noncommercial/1.0.0" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PolyForm Noncommercial License 1.0.0</a>.
                  C&apos;est cette licence, et non les présentes Conditions, qui définit ce que vous pouvez faire du logiciel et de son
                  code source. En résumé, elle autorise l&apos;usage personnel, éducatif, de recherche et de loisir, ainsi que
                  l&apos;usage par les associations, écoles, universités et institutions publiques.
                </p>
                <p className="mb-4">
                  Tout usage commercial, y compris pour le compte d&apos;une entreprise ou de clients, requiert une licence
                  commerciale de Mayorana. Certains outils proposent une édition payante achetée sur leur page&nbsp;: le paiement
                  est assuré par Stripe, et la clé de licence est affichée après l&apos;achat et envoyée par e-mail.
                </p>
                <p>
                  Le code source des outils de bureau est publié sur GitHub. Le nom Mayorana, les noms des outils et leurs logos
                  sont des marques et ne sont pas couverts par la licence PolyForm.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Responsabilités de l&apos;utilisateur</h2>
                <p className="mb-4">En utilisant notre site et nos services, vous acceptez de&nbsp;:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fournir des informations exactes et complètes</li>
                  <li>Maintenir la confidentialité de vos identifiants de connexion</li>
                  <li>N&apos;utiliser les services qu&apos;à des fins licites</li>
                  <li>Respecter les droits de propriété intellectuelle</li>
                  <li>Ne pas perturber le fonctionnement du site ou des services</li>
                  <li>Ne pas tenter d&apos;accéder de manière non autorisée à nos systèmes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Avertissement</h2>
                <p>
                  Les contenus du site Mayorana sont fournis «&nbsp;en l&apos;état&nbsp;». Mayorana ne donne aucune garantie, expresse ou
                  implicite, et décline toute autre garantie, y compris notamment les garanties implicites de qualité marchande,
                  d&apos;adéquation à un usage particulier, ou de non-violation de droits de propriété intellectuelle ou autres droits.
                </p>
                <p className="mt-4">
                  En outre, Mayorana ne garantit pas et ne fait aucune déclaration quant à l&apos;exactitude, aux résultats probables
                  ou à la fiabilité de l&apos;utilisation des contenus de son site, ou relatifs à de tels contenus, ou présents sur
                  tout site lié.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Limitations de responsabilité</h2>
                <p>
                  En aucun cas Mayorana ou ses fournisseurs ne pourront être tenus responsables de quelque dommage que ce soit
                  (y compris, sans limitation, les dommages pour perte de données, de profits ou pour interruption d&apos;activité)
                  découlant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser les contenus du site Mayorana, même si Mayorana
                  ou l&apos;un de ses représentants autorisés a été informé, oralement ou par écrit, de la possibilité d&apos;un tel
                  dommage. Certaines juridictions n&apos;autorisant pas de telles limitations, elles peuvent ne pas s&apos;appliquer à vous.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Politique de confidentialité</h2>
                <p>
                  Votre vie privée est importante pour nous. Notre Politique de confidentialité explique comment nous collectons,
                  utilisons et protégeons vos informations lorsque vous utilisez nos services. En utilisant nos services, vous
                  acceptez cette collecte et cette utilisation conformément à notre Politique de confidentialité.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Liens et services tiers</h2>
                <p>
                  Notre site peut contenir des liens vers des sites ou services tiers, comme GitHub, Stripe et les réseaux
                  sociaux. Nous ne sommes pas responsables du contenu, des politiques de confidentialité ou des pratiques de
                  ces sites tiers. Nous vous encourageons à lire les conditions et politiques de confidentialité de tout site
                  tiers que vous visitez.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Propriété intellectuelle</h2>
                <p className="mb-4">
                  Le contenu, l&apos;organisation, les graphismes, le design et autres éléments du site sont protégés par les lois
                  applicables en matière de droits d&apos;auteur et de propriété. Sauf dans la mesure permise par les présentes
                  Conditions ou par une licence logicielle, toute copie, redistribution, utilisation ou publication d&apos;une partie
                  quelconque du site est interdite.
                </p>
                <p>
                  Toutes les marques, marques de service et noms commerciaux sont la propriété de Mayorana ou de leurs détenteurs respectifs.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Indemnisation</h2>
                <p>
                  Vous acceptez d&apos;indemniser et de garantir Mayorana et ses sociétés affiliées, dirigeants, agents et employés
                  contre toute réclamation ou demande, y compris les honoraires raisonnables d&apos;avocats, formulée par un tiers en
                  raison de ou liée à votre utilisation du site, à votre violation des présentes Conditions, ou à votre violation
                  de tout droit d&apos;autrui.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Résiliation</h2>
                <p>
                  Nous pouvons résilier ou suspendre votre accès au site et aux services immédiatement, sans préavis ni responsabilité,
                  pour quelque motif que ce soit, y compris en cas de manquement aux présentes Conditions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Droit applicable</h2>
                <p>
                  Les présentes Conditions sont régies et interprétées conformément au droit suisse, sans tenir compte des règles
                  de conflit de lois. Tout litige relatif aux présentes Conditions relèvera de la compétence exclusive des tribunaux suisses.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Modifications des Conditions</h2>
                <p>
                  Mayorana se réserve le droit de modifier les présentes Conditions à tout moment. Toute modification importante
                  sera signalée par la publication des Conditions mises à jour sur cette page, avec une nouvelle date de révision.
                  Votre utilisation continue du site après ces modifications vaudra acceptation des Conditions modifiées.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Divisibilité</h2>
                <p>
                  Si une disposition des présentes Conditions est jugée inapplicable ou invalide, elle sera limitée ou supprimée
                  dans la mesure minimale nécessaire afin que les autres dispositions des Conditions demeurent pleinement en vigueur.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Informations de contact</h2>
                <p className="mb-4">
                  Pour toute question relative aux présentes Conditions d&apos;utilisation, contactez-nous&nbsp;:
                </p>
                <div className="bg-secondary p-4 rounded-lg">
                  <p><strong>E-mail&nbsp;:</strong> contact@mayorana.ch</p>
                  <p><strong>Adresse&nbsp;:</strong> Mayorana SARL, Suisse</p>
                  <p><strong>Site web&nbsp;:</strong> mayorana.ch</p>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </LayoutTemplate>
  );
}
