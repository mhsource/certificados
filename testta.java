import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SeuServicoTest {

    @Mock
    private AcordoRepository acordoRepository;

    @Mock
    private AcordoMapper acordoMapper;

    @InjectMocks
    private SeuServico servico;

    @Test
    public void testBuscarContasPorAcordoWithResults() {
        // Configurando os valores de entrada
        String idAcordo = "123456789012345";
        BigInteger IdAcordoInicial = new BigInteger(idAcordo.substring(0, 12));
        Integer IdAcordoFinal = Integer.parseInt(idAcordo.substring(12, 17));

        // Configurando os mocks
        List<AcordoEntity> acordoEntities = Arrays.asList(new AcordoEntity(), new AcordoEntity());
        ContasAcordoEntity expectedEntity = new ContasAcordoEntity();

        when(acordoRepository.findByNumTitCobrAndNumContCedeTitl(IdAcordoInicial, IdAcordoFinal)).thenReturn(acordoEntities);
        when(acordoMapper.toInputData(acordoEntities)).thenReturn(expectedEntity);

        // Chamando o método a ser testado
        ContasAcordoEntity result = servico.buscarContasPorAcordo(idAcordo);

        // Verificações
        verify(acordoRepository).findByNumTitCobrAndNumContCedeTitl(IdAcordoInicial, IdAcordoFinal);
        verify(acordoMapper).toInputData(acordoEntities);

        assertNotNull(result);
        assertEquals(expectedEntity, result);
    }

    @Test
    public void testBuscarContasPorAcordoNoResults() {
        // Configurando os valores de entrada
        String idAcordo = "123456789012345";
        BigInteger IdAcordoInicial = new BigInteger(idAcordo.substring(0, 12));
        Integer IdAcordoFinal = Integer.parseInt(idAcordo.substring(12, 17));

        // Configurando os mocks
        when(acordoRepository.findByNumTitCobrAndNumContCedeTitl(IdAcordoInicial, IdAcordoFinal)).thenReturn(Collections.emptyList());

        // Chamando o método a ser testado
        ContasAcordoEntity result = servico.buscarContasPorAcordo(idAcordo);

        // Verificações
        verify(acordoRepository).findByNumTitCobrAndNumContCedeTitl(IdAcordoInicial, IdAcordoFinal);
        verify(acordoMapper, never()).toInputData(any());

        assertNull(result);
    }
}
